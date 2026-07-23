// Public delivery-region lookup. Mirrors
// GET /public/storefront/stores/:id/delivery-regions.
const API_URL = (import.meta.env.VITE_API_URL ??
  "http://localhost:9091/api") as string;

export interface DeliveryRegion {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  fee: number;
  minOrderAmount: number;
  estimatedMinutes: number | null;
  isActive: boolean;
  sortOrder: number;
}

export const deliveryRegionsApi = {
  async forStore(storeId: string): Promise<DeliveryRegion[]> {
    const url = `${API_URL}/public/storefront/stores/${encodeURIComponent(
      storeId,
    )}/delivery-regions`;
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(body.message ?? `HTTP ${res.status}`);
    }
    const json = await res.json();
    return (json.data ?? json) as DeliveryRegion[];
  },
};
