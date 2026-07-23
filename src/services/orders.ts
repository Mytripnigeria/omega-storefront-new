import { apiRequest } from "@/lib/api-client";

export type OrderStatus =
  | "initiated"
  | "pending"
  | "preparing"
  | "ready"
  | "delivering"
  | "served"
  | "completed"
  | "cancelled";

export type PaymentChannel =
  | "cash"
  | "card"
  | "wallet"
  | "points"
  | "paystack";

export interface OrderItem {
  id: string;
  productId: string | null;
  comboId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  variation: Record<string, unknown> | null;
  addons: Record<string, unknown>[] | null;
  notes: string | null;
  prepStatus: "pending" | "preparing" | "ready";
  createdAt: string;
  updatedAt: string;
}

export interface StorefrontOrder {
  id: string;
  orderNumber: number;
  storeId: string;
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  isDelivery: boolean;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | null;
  paymentChannel: PaymentChannel | null;
  paymentReference: string | null;
  deliveryFee: number;
  tipAmount: number;
  couponCode: string | null;
  couponDiscount: number;
  deliveryAddressId: string | null;
  deliveryAddress: Record<string, unknown> | null;
  scheduledFor: string | null;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderItem {
  productId?: string;
  comboId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  variationId?: string;
  variation?: Record<string, unknown>;
  addons?: Record<string, unknown>[];
  notes?: string;
}

export interface PlaceOrderRequest {
  storeId: string;
  isDelivery: boolean;
  deliveryAddressId?: string;
  /** Delivery region — the backend prices the delivery from it. */
  deliveryRegionId?: string;
  deliveryAddress?: Record<string, unknown>;
  scheduledFor?: string;
  items: PlaceOrderItem[];
  paymentChannel: "cash" | "paystack" | "wallet" | "points";
  savedPaymentMethodId?: string;
  couponCode?: string;
  tipAmount?: number;
  pointsToRedeem?: number;
  notes?: string;
}

export interface PaymentInit {
  requiresAction: boolean;
  reference?: string;
  publicKey?: string;
  /** Amount in kobo for the inline popup (server-authoritative). */
  amount?: number;
}

export interface PlaceOrderResponse {
  order: StorefrontOrder;
  payment?: PaymentInit;
}

export interface OrdersListResponse {
  data: StorefrontOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ordersApi = {
  place(req: PlaceOrderRequest) {
    return apiRequest<PlaceOrderResponse>("/storefront/me/orders", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },
  verifyPayment(orderId: string, reference: string) {
    return apiRequest<StorefrontOrder>(
      `/storefront/me/orders/${orderId}/verify-payment`,
      { method: "POST", body: JSON.stringify({ reference }) },
    );
  },
  list(params?: { status?: string; page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiRequest<OrdersListResponse>(
      `/storefront/me/orders${qs ? `?${qs}` : ""}`,
    );
  },
  get(id: string) {
    return apiRequest<StorefrontOrder>(`/storefront/me/orders/${id}`);
  },
};
