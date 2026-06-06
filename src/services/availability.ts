// Public store-availability lookup. Mirrors GET /public/storefront/stores/:id/availability.
import { getBusinessId } from "@/lib/business";

const API_URL = (import.meta.env.VITE_API_URL ??
  "http://localhost:9091/api") as string;

export interface AvailabilitySlot {
  startsAt: string;
  endsAt: string;
}

export interface StoreAvailability {
  date: string;
  asapAvailable: boolean;
  slots: AvailabilitySlot[];
}

export const availabilityApi = {
  async forStore(storeId: string, date: string): Promise<StoreAvailability> {
    const url = `${API_URL}/public/storefront/stores/${encodeURIComponent(
      storeId,
    )}/availability?businessId=${encodeURIComponent(
      getBusinessId(),
    )}&date=${encodeURIComponent(date)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(body.message ?? `HTTP ${res.status}`);
    }
    const json = await res.json();
    return (json.data ?? json) as StoreAvailability;
  },
};
