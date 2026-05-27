import { apiRequest } from "@/lib/api-client";

export interface UserSession {
  id: string;
  email: string;
  businessId: string;
  customerId: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: UserSession;
}

export interface RegisterPayload {
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  referredByCode?: string;
}

export interface LoginPayload {
  businessId: string;
  email: string;
  password: string;
}

export interface PhoneOtpRequestPayload {
  businessId: string;
  phone: string;
  purpose?: "login" | "register";
}

export interface PhoneOtpVerifyPayload {
  businessId: string;
  phone: string;
  code: string;
  /** Required only when the phone has no existing customer record. */
  firstName?: string;
  lastName?: string;
  referredByCode?: string;
}

export const authApi = {
  register(payload: RegisterPayload) {
    return apiRequest<AuthResult>("/auth/storefront/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload: LoginPayload) {
    return apiRequest<AuthResult>("/auth/storefront/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  logout() {
    return apiRequest<void>("/auth/storefront/logout", { method: "POST" });
  },
  requestPhoneOtp(payload: PhoneOtpRequestPayload) {
    return apiRequest<{ ok: true; phone: string }>(
      "/auth/storefront/phone/request-otp",
      { method: "POST", body: JSON.stringify(payload) },
    );
  },
  verifyPhoneOtp(payload: PhoneOtpVerifyPayload) {
    return apiRequest<AuthResult>("/auth/storefront/phone/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthday: string | null;
  gender: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  street: string | null;
  zipCode: string | null;
  walletBalance: number;
  points: number;
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
  referralCode: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export const profileApi = {
  me() {
    return apiRequest<CustomerProfile>("/storefront/me");
  },
  update(data: Partial<CustomerProfile>) {
    return apiRequest<CustomerProfile>("/storefront/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  myOrders() {
    return apiRequest<{ data: StorefrontOrder[]; total: number }>(
      "/storefront/me/orders?limit=50",
    );
  },
  myWallet() {
    return apiRequest<WalletTx[]>("/storefront/me/wallet-transactions");
  },
  myPoints() {
    return apiRequest<PointsTx[]>("/storefront/me/points-transactions");
  },
};

export interface StorefrontOrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface StorefrontOrder {
  id: string;
  orderNumber: number;
  status: string;
  channel: string;
  isDelivery: boolean;
  total: number;
  paidAmount: number;
  items: StorefrontOrderItem[];
  createdAt: string;
}

export interface WalletTx {
  id: string;
  type: "credit" | "debit";
  amount: number;
  balance: number;
  description: string;
  reference: string | null;
  createdAt: string;
}

export interface PointsTx {
  id: string;
  type: "earned" | "redeemed" | "expired" | "adjusted";
  points: number;
  balance: number;
  description: string;
  orderId: string | null;
  createdAt: string;
}
