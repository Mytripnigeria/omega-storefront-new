// Public menu API — no auth required.
import { getBusinessId } from "@/lib/business";

const API_URL = (import.meta.env.VITE_API_URL ??
  "http://localhost:9091/api") as string;

export interface PublicCategory {
  id: string;
  businessId: string;
  storeId: string | null;
  type: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  order: number;
  parentId: string | null;
  channels: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicVariation {
  id: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
}

export interface PublicAddon {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface PublicAddonGroup {
  id: string;
  name: string;
  required: boolean;
  minSelections: number | null;
  maxSelections: number | null;
  addons: PublicAddon[];
}

export interface PublicProduct {
  id: string;
  storeId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  imageUrl: string | null;
  preparationTime: number | null;
  status: boolean;
  variations: PublicVariation[];
  addonGroups: PublicAddonGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicComboItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface PublicCombo {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number;
  imageUrl: string | null;
  isActive: boolean;
  items: PublicComboItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicStore {
  id: string;
  businessId: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  phone: string;
  email: string;
  logoUrl: string | null;
  description: string | null;
  timezone: string;
  openingHours: Record<
    string,
    { open: string; close: string; closed: boolean }
  > | null;
  deliveryRadiusKm: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

async function publicGet<T>(path: string): Promise<T> {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API_URL}${path}${sep}businessId=${encodeURIComponent(getBusinessId())}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const json = await res.json();
  return (json.data ?? json) as T;
}

export const menuApi = {
  stores() {
    return publicGet<PublicStore[]>("/public/storefront/stores");
  },
  categories() {
    return publicGet<PublicCategory[]>("/public/storefront/menu/categories");
  },
  products(storeId: string, opts?: { categoryId?: string; search?: string }) {
    const q = new URLSearchParams({ storeId });
    if (opts?.categoryId) q.set("categoryId", opts.categoryId);
    if (opts?.search) q.set("search", opts.search);
    return publicGet<PublicProduct[]>(
      `/public/storefront/menu/products?${q.toString()}`,
    );
  },
  product(id: string) {
    return publicGet<PublicProduct>(
      `/public/storefront/menu/products/${encodeURIComponent(id)}`,
    );
  },
  combos(storeId: string) {
    return publicGet<PublicCombo[]>(
      `/public/storefront/menu/combos?storeId=${encodeURIComponent(storeId)}`,
    );
  },
  recommendations(storeId: string, opts?: { productId?: string; limit?: number }) {
    const q = new URLSearchParams({ storeId });
    if (opts?.productId) q.set("productId", opts.productId);
    if (opts?.limit) q.set("limit", String(opts.limit));
    return publicGet<PublicProduct[]>(
      `/public/storefront/recommendations?${q.toString()}`,
    );
  },
};
