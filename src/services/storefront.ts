// Public storefront API service. No auth required.
const API_URL = (import.meta.env.VITE_API_URL ??
  "http://localhost:9091/api") as string;
const BUSINESS_ID = (import.meta.env.VITE_BUSINESS_ID ?? "") as string;

export type StoreStatus = "live" | "offline" | "maintenance";
export type MenuLayout = "grouped" | "grid" | "list";
export type PageStatus = "draft" | "published";
export type PageTemplate =
  | "homepage"
  | "menu"
  | "standard"
  | "contact"
  | "faq";
export type BannerTheme = "light" | "dark";

export interface StorefrontConfig {
  businessId: string;
  storeName: string;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  customDomain: string | null;
  storeStatus: StoreStatus;
  maintenanceMessage: string | null;
  activeThemeId: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  fontFamily: string;
  onlineOrderingEnabled: boolean;
  reservationsEnabled: boolean;
  reviewsEnabled: boolean;
  walletEnabled: boolean;
  loyaltyEnabled: boolean;
  menuLayout: MenuLayout;
  menuShowImages: boolean;
  menuShowCalories: boolean;
  menuShowPrepTime: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  seoOgImageUrl: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialTiktok: string | null;
  socialYoutube: string | null;
  socialWhatsapp: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  /** VAT rate fraction (0.075 = 7.5%) — set in admin → Settings → Business. */
  taxRate: number;
  /** Loyalty points earned per ₦1 spent. */
  pointsPerNaira: number;
  /** Naira value of one redeemed loyalty point. */
  nairaPerPoint: number;
  createdAt: string;
  updatedAt: string;
}

export interface StorefrontBanner {
  id: string;
  businessId: string;
  title: string;
  description: string | null;
  imageUrl: string;
  theme: BannerTheme;
  actionText: string | null;
  actionUrl: string | null;
  isActive: boolean;
  position: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StorefrontPage {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  template: PageTemplate;
  status: PageStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  content: string | null;
  position: number;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

async function publicGet<T>(path: string): Promise<T> {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API_URL}${path}${sep}businessId=${encodeURIComponent(BUSINESS_ID)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const json = await res.json();
  return (json.data ?? json) as T;
}

export const storefrontApi = {
  getConfig() {
    return publicGet<StorefrontConfig>("/public/storefront/config");
  },
  getBanners() {
    return publicGet<StorefrontBanner[]>("/public/storefront/banners");
  },
  getPages() {
    return publicGet<StorefrontPage[]>("/public/storefront/pages");
  },
  getPage(slug: string) {
    return publicGet<StorefrontPage>(
      `/public/storefront/pages/${encodeURIComponent(slug)}`,
    );
  },
};

export { BUSINESS_ID };
