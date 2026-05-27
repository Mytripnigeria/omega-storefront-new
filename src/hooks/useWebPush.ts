import { useCallback, useEffect, useState } from "react";
import { pushApi } from "@/services/push";
import { tokenStorage } from "@/lib/api-client";

/** Convert base64url VAPID key → Uint8Array that PushManager.subscribe expects. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const normalized = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf;
}

/** Encode an ArrayBuffer as base64url (the format the backend stores). */
function arrayBufferToBase64Url(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export type WebPushStatus =
  | "loading"
  | "unsupported"
  | "permission-denied"
  | "unconfigured"
  | "subscribed"
  | "unsubscribed";

export interface UseWebPushResult {
  status: WebPushStatus;
  error: string | null;
  isBusy: boolean;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
}

/**
 * Manages the customer's browser-push lifecycle: fetch the server's VAPID
 * public key, register / unregister with the service worker, and POST / DELETE
 * the subscription on the backend. Re-reads the live SW state on mount so the
 * Settings toggle reflects reality across sessions.
 */
export function useWebPush(): UseWebPushResult {
  const [status, setStatus] = useState<WebPushStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    if (typeof window === "undefined") {
      setStatus("unsupported");
      return;
    }
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setStatus("unsupported");
      return;
    }
    if (!tokenStorage.getToken()) {
      // Not logged in — push toggle is hidden in the UI but be defensive.
      setStatus("unsubscribed");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setStatus("subscribed");
      } else if (Notification.permission === "denied") {
        setStatus("permission-denied");
      } else {
        setStatus("unsubscribed");
      }
    } catch (e) {
      setError((e as Error).message);
      setStatus("unsubscribed");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enable = useCallback(async () => {
    setError(null);
    setIsBusy(true);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push is not supported in this browser.");
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("permission-denied");
        return;
      }
      const { publicKey } = await pushApi.publicKey();
      if (!publicKey) {
        setStatus("unconfigured");
        setError("Push notifications aren't enabled by the merchant yet.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = sub.toJSON();
      const keys = json.keys as { p256dh?: string; auth?: string } | undefined;
      await pushApi.subscribe({
        endpoint: sub.endpoint,
        keys: {
          p256dh: keys?.p256dh ?? arrayBufferToBase64Url(sub.getKey("p256dh")),
          auth: keys?.auth ?? arrayBufferToBase64Url(sub.getKey("auth")),
        },
        userAgent: navigator.userAgent,
      });
      setStatus("subscribed");
    } catch (e) {
      setError((e as Error).message ?? "Couldn't enable push notifications.");
    } finally {
      setIsBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setError(null);
    setIsBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        // Find the row id on the backend by endpoint so we can DELETE it.
        const rows = await pushApi.list().catch(() => []);
        const row = rows.find((r) => r.endpoint === sub.endpoint);
        if (row) await pushApi.unsubscribe(row.id).catch(() => undefined);
        await sub.unsubscribe();
      }
      setStatus("unsubscribed");
    } catch (e) {
      setError((e as Error).message ?? "Couldn't disable push notifications.");
    } finally {
      setIsBusy(false);
    }
  }, []);

  return { status, error, isBusy, enable, disable };
}
