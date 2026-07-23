const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:9091/api") as string;

const TOKEN_KEY = "omega_user_token";
const REFRESH_TOKEN_KEY = "omega_user_refresh_token";

export const tokenStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (t: string) => localStorage.setItem(REFRESH_TOKEN_KEY, t),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

const REFRESH_TIMEOUT_MS = 10_000;

/**
 * Error thrown for a non-2xx response. Carries the HTTP status so callers can
 * treat specific outcomes (e.g. 409 "already reviewed") as a normal state
 * instead of surfacing a raw error toast. Still a plain `Error` for every
 * existing `(e as Error).message` call site.
 */
export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let isRefreshing = false;
type RefreshWaiter = (token: string | null) => void;
let refreshQueue: RefreshWaiter[] = [];

/**
 * Notifies the app that the current session has expired and tokens have been
 * cleared. AuthContext listens for this and routes the user to /login.
 */
function broadcastAuthExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("omega:auth-expired"));
  }
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/storefront/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw new Error("Refresh timed out");
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new Error("Session expired");

  const json = await res.json();
  const data = json.data ?? json;
  const newAccess = data.accessToken as string;
  if (!newAccess) throw new Error("Refresh did not return an access token");
  tokenStorage.setToken(newAccess);
  // Backend rotates the refresh token — pick up the new one if returned.
  if (typeof data.refreshToken === "string") {
    tokenStorage.setRefreshToken(data.refreshToken);
  }
  return newAccess;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = tokenStorage.getToken();

  const makeRequest = async (accessToken: string | null) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    return fetch(`${API_URL}${path}`, { ...options, headers });
  };

  let response = await makeRequest(token);

  if (response.status === 401 && token) {
    let nextToken: string | null = null;

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        nextToken = await refreshAccessToken();
        // Drain queued waiters first so they retry with the new token.
        refreshQueue.splice(0).forEach((cb) => cb(nextToken));
      } catch (err) {
        isRefreshing = false;
        refreshQueue.splice(0).forEach((cb) => cb(null));
        tokenStorage.clear();
        broadcastAuthExpired();
        throw err;
      }
      isRefreshing = false;
    } else {
      nextToken = await new Promise<string | null>((resolve) => {
        refreshQueue.push(resolve);
      });
      if (!nextToken) {
        // Refresh-in-progress failed for the leader; everyone bails.
        throw new Error("Session expired");
      }
    }
    // Retry the original request with the fresh token. This `await` is the
    // bug fix from before — every queued caller now reads its own response.
    response = await makeRequest(nextToken);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(
      errorBody.message ?? `HTTP ${response.status}`,
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;

  const json = await response.json();
  // Check for the *key*, not truthiness: the API envelope legitimately carries
  // `data: null` (e.g. "no review for this order yet"), and `json.data ?? json`
  // would hand back the truthy envelope instead of the null the caller expects.
  return (json && typeof json === "object" && "data" in json
    ? json.data
    : json) as T;
}
