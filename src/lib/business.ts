// Runtime resolution of the business this storefront serves.
//
// Priority:
//   1. VITE_BUSINESS_ID env (single-tenant deploy / local dev) — wins always.
//   2. localStorage cache (avoids a round-trip on repeat visits).
//   3. GET /public/storefront/resolve?host=<hostname> — lets one deployment
//      serve many merchants by custom domain (e.g. scoops.ng -> their business).
const API_URL = (import.meta.env.VITE_API_URL ??
  "http://localhost:9091/api") as string;
const ENV_BUSINESS_ID = (import.meta.env.VITE_BUSINESS_ID ?? "") as string;
const CACHE_KEY = "omega_business_id";

function readCache(): string {
  try {
    return localStorage.getItem(CACHE_KEY) ?? "";
  } catch {
    return "";
  }
}

let resolved: string = ENV_BUSINESS_ID || readCache();
let inflight: Promise<string> | null = null;

/** Synchronous accessor — returns the resolved id (or "" before bootstrap). */
export function getBusinessId(): string {
  return resolved;
}

/**
 * Resolves and caches the businessId. Safe to call repeatedly — concurrent
 * callers share one in-flight request. Call once during app bootstrap before
 * any data fetch (see main.tsx).
 */
export async function ensureBusinessId(): Promise<string> {
  if (ENV_BUSINESS_ID) {
    resolved = ENV_BUSINESS_ID;
    return resolved;
  }
  if (resolved) return resolved;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const host =
        typeof window !== "undefined" ? window.location.host : "";
      if (host) {
        const res = await fetch(
          `${API_URL}/public/storefront/resolve?host=${encodeURIComponent(host)}`,
        );
        if (res.ok) {
          const json = await res.json();
          const data = json.data ?? json;
          if (data?.businessId) {
            resolved = data.businessId as string;
            try {
              localStorage.setItem(CACHE_KEY, resolved);
            } catch {
              // ignore quota / private-mode errors
            }
          }
        }
      }
    } catch {
      // Network failure — leave `resolved` as-is (possibly "").
    } finally {
      inflight = null;
    }
    return resolved;
  })();

  return inflight;
}
