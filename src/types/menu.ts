export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  options?: ItemOption[];
  popular?: boolean;
  newRelease?: boolean;
  isCombo?: boolean;
  comboItems?: ComboItem[];
}

export interface ComboItem {
  itemId: string;
  name: string;
  originalPrice: number;
}

export interface ItemOption {
  id: string;
  name: string;
  choices: OptionChoice[];
  required?: boolean;
  maxSelections?: number;
  /** True for the product's variation group (its price replaces the base price). */
  isVariation?: boolean;
}

export interface OptionChoice {
  id: string;
  name: string;
  price?: number;
  image?: string;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions?: { [optionId: string]: string[] };
  specialRequest?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: OrderStatus;
  type: 'pickup' | 'delivery';
  location?: string;
  address?: string;
  scheduledTime?: string;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  pointsEarned: number;
  createdAt: Date;
  estimatedTime?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out-for-delivery'
  | 'delivered'
  | 'picked-up'
  | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  walletBalance: number;
  loyaltyPoints: number;
  tier: LoyaltyTier;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Category {
  id: string;
  name: string;
  emoji: string;
}
