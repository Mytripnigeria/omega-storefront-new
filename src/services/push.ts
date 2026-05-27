import { apiRequest } from "@/lib/api-client";

export interface PushSubscriptionRow {
  id: string;
  subjectType: "customer" | "staff";
  endpoint: string;
  createdAt: string;
}

export const pushApi = {
  /** Fetches the server's VAPID public key. Returns null if push isn't configured. */
  publicKey: () =>
    apiRequest<{ publicKey: string | null }>("/notifications/web-push/public-key"),

  /** Registers a browser push subscription with the backend. */
  subscribe: (payload: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userAgent?: string;
  }) =>
    apiRequest<PushSubscriptionRow>("/storefront/me/push-subscriptions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  list: () => apiRequest<PushSubscriptionRow[]>("/storefront/me/push-subscriptions"),

  unsubscribe: (id: string) =>
    apiRequest<void>(`/storefront/me/push-subscriptions/${id}`, { method: "DELETE" }),
};
