import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, MenuItem, User } from '@/types/menu';

interface CartContextType {
  items: CartItem[];
  user: User;
  orderType: 'pickup' | 'delivery';
  selectedLocation: string;
  selectedTime: string;
  isLoggedIn: boolean;
  addItem: (menuItem: MenuItem, quantity?: number, options?: { [key: string]: string[] }, specialRequest?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: 'pickup' | 'delivery') => void;
  setSelectedLocation: (location: string) => void;
  setSelectedTime: (time: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  pointsToEarn: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedLocation, setSelectedLocation] = useState('Lekki Phase 1');
  const [selectedTime, setSelectedTime] = useState('ASAP');
  const [isLoggedIn] = useState(false);
  
  // Mock user data
  const [user] = useState<User>({
    id: '1',
    name: 'Guest User',
    email: 'guest@example.com',
    walletBalance: 15000,
    loyaltyPoints: 1250,
    tier: 'gold',
  });

  const addItem = useCallback((
    menuItem: MenuItem,
    quantity = 1,
    selectedOptions?: { [key: string]: string[] },
    specialRequest?: string
  ) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.menuItem.id === menuItem.id && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, {
        id: `${menuItem.id}-${Date.now()}`,
        menuItem,
        quantity,
        selectedOptions,
        specialRequest,
      }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.075);
  const total = subtotal + tax;
  const pointsToEarn = Math.floor(subtotal / 100) * 10;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      user,
      orderType,
      selectedLocation,
      selectedTime,
      isLoggedIn,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      setOrderType,
      setSelectedLocation,
      setSelectedTime,
      subtotal,
      tax,
      total,
      pointsToEarn,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
