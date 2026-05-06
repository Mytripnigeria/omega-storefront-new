import { apiRequest } from "@/lib/api-client";

export interface CouponSummary {
  id: string;
  code: string;
  description: string | null;
  type: "percentage" | "fixed";
  value: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  reason?: string;
  coupon?: CouponSummary;
  discountAmount?: number;
}

export interface CouponItemLine {
  productId?: string;
  categoryId?: string;
  lineTotal: number;
}

export const couponsApi = {
  validate(
    code: string,
    subtotal: number,
    items: CouponItemLine[] = [],
  ) {
    return apiRequest<ValidateCouponResponse>("/storefront/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, subtotal, items }),
    });
  },
};
