import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  authApi,
  profileApi,
  type CustomerProfile,
  type GoogleAuthPayload,
  type LoginPayload,
  type PhoneOtpRequestPayload,
  type PhoneOtpVerifyPayload,
  type RegisterPayload,
  type UserSession,
} from "@/services/auth";
import { tokenStorage } from "@/lib/api-client";

interface AuthContextValue {
  user: UserSession | null;
  profile: CustomerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  requestPhoneOtp: (payload: PhoneOtpRequestPayload) => Promise<void>;
  loginWithPhoneOtp: (payload: PhoneOtpVerifyPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const me = await profileApi.me();
      setProfile(me);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = tokenStorage.getToken();
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      try {
        const me = await profileApi.me();
        if (!cancelled) {
          setProfile(me);
          // Reconstruct UserSession from JWT claims via the profile (we don't store user separately)
          setUser({
            id: me.id,
            email: me.email ?? "",
            businessId: "",
            customerId: me.id,
          });
        }
      } catch {
        if (!cancelled) {
          tokenStorage.clear();
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // api-client dispatches `omega:auth-expired` when refresh fails. Drop the
  // session here so route guards can redirect the customer to /login.
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setProfile(null);
    };
    window.addEventListener("omega:auth-expired", onExpired);
    return () => window.removeEventListener("omega:auth-expired", onExpired);
  }, []);

  const persistAuth = useCallback(
    async (session: { accessToken: string; refreshToken: string; user: UserSession }) => {
      tokenStorage.setToken(session.accessToken);
      tokenStorage.setRefreshToken(session.refreshToken);
      setUser(session.user);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await authApi.login(payload);
      await persistAuth(result);
    },
    [persistAuth],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await authApi.register(payload);
      await persistAuth(result);
    },
    [persistAuth],
  );

  const loginWithGoogle = useCallback(
    async (payload: GoogleAuthPayload) => {
      const result = await authApi.google(payload);
      await persistAuth(result);
    },
    [persistAuth],
  );

  const requestPhoneOtp = useCallback(async (payload: PhoneOtpRequestPayload) => {
    await authApi.requestPhoneOtp(payload);
  }, []);

  const loginWithPhoneOtp = useCallback(
    async (payload: PhoneOtpVerifyPayload) => {
      const result = await authApi.verifyPhoneOtp(payload);
      await persistAuth(result);
    },
    [persistAuth],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    tokenStorage.clear();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshProfile,
      requestPhoneOtp,
      loginWithPhoneOtp,
    }),
    [
      user,
      profile,
      isLoading,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshProfile,
      requestPhoneOtp,
      loginWithPhoneOtp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
