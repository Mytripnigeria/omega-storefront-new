import { apiRequest } from "@/lib/api-client";

export interface OrderReview {
  id: string;
  businessId: string;
  storeId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string | null;
  isPublished: boolean;
  /** Photos the customer attached, if any. */
  imageUrls: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export const reviewsApi = {
  forOrder(orderId: string) {
    return apiRequest<OrderReview | null>(
      `/storefront/me/orders/${orderId}/review`,
    );
  },
  submit(
    orderId: string,
    data: { rating: number; comment?: string; images?: string[] },
  ) {
    return apiRequest<OrderReview>(`/storefront/me/orders/${orderId}/review`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
