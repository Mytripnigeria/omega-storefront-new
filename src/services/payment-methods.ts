import { apiRequest } from "@/lib/api-client";

export type PaymentMethodBrand =
  | "visa"
  | "mastercard"
  | "verve"
  | "amex"
  | "discover"
  | "other";

export interface CustomerPaymentMethod {
  id: string;
  customerId: string;
  businessId: string;
  brand: PaymentMethodBrand;
  last4: string;
  expMonth: string;
  expYear: string;
  cardholderName: string | null;
  bank: string | null;
  channel: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePaymentMethodRequest {
  isDefault?: boolean;
  cardholderName?: string;
}

export const paymentMethodsApi = {
  list() {
    return apiRequest<CustomerPaymentMethod[]>("/storefront/me/payment-methods");
  },
  update(id: string, data: UpdatePaymentMethodRequest) {
    return apiRequest<CustomerPaymentMethod>(
      `/storefront/me/payment-methods/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
    );
  },
  remove(id: string) {
    return apiRequest<void>(`/storefront/me/payment-methods/${id}`, {
      method: "DELETE",
    });
  },
};
