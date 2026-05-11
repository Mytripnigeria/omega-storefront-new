import { apiRequest } from "@/lib/api-client";

export interface CustomerAddress {
  id: string;
  customerId: string;
  businessId: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  label: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  isDefault?: boolean;
}

export type UpdateAddressRequest = Partial<CreateAddressRequest>;

export const addressesApi = {
  list() {
    return apiRequest<CustomerAddress[]>("/storefront/me/addresses");
  },
  get(id: string) {
    return apiRequest<CustomerAddress>(`/storefront/me/addresses/${id}`);
  },
  create(data: CreateAddressRequest) {
    return apiRequest<CustomerAddress>("/storefront/me/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: UpdateAddressRequest) {
    return apiRequest<CustomerAddress>(`/storefront/me/addresses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  remove(id: string) {
    return apiRequest<void>(`/storefront/me/addresses/${id}`, {
      method: "DELETE",
    });
  },
};
