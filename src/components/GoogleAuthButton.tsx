import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getBusinessId } from "@/lib/business";
import { toast } from "sonner";

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "") as string;
const GIS_SRC = "https://accounts.google.com/gsi/client";

// Load the Google Identity Services script once, shared across mounts.
let gisPromise: Promise<void> | null = null;
function loadGis(): Promise<void> {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).google?.accounts?.id) return resolve();
    const s = document.createElement("script");
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google"));
    document.head.appendChild(s);
  });
  return gisPromise;
}

interface GoogleAuthButtonProps {
  /** Google button label variant. */
  text?: "signin_with" | "signup_with" | "continue_with";
  onSuccess?: () => void;
}

/**
 * "Continue with Google" button backed by Google Identity Services. Renders
 * nothing if VITE_GOOGLE_CLIENT_ID is unset so the rest of the form still works.
 */
export function GoogleAuthButton({
  text = "continue_with",
  onSuccess,
}: GoogleAuthButtonProps) {
  const { loginWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadGis()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp: { credential: string }) => {
            try {
              await loginWithGoogle({
                businessId: getBusinessId(),
                idToken: resp.credential,
              });
              onSuccess?.();
            } catch (e) {
              toast.error((e as Error).message ?? "Google sign-in failed");
            }
          },
        });
        google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text,
          width: Math.min(containerRef.current.offsetWidth || 320, 400),
        });
      })
      .catch(() => {
        // Script blocked / offline — button just won't appear.
      });
    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, onSuccess, text]);

  if (!GOOGLE_CLIENT_ID) return null;
  return <div ref={containerRef} className="w-full flex justify-center" />;
}
