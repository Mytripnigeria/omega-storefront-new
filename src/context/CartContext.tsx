import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CartItem, MenuItem } from "@/types/menu";
import { useAuth } from "@/context/AuthContext";
import { useStorefront } from "@/context/StorefrontContext";
import { computeLineUnitPrice } from "@/lib/pricing";

const STORAGE_KEY = "omega_cart_v2";

interface PersistedCart {
  items: CartItem[];
  orderType: "pickup" | "delivery";
  storeId: string | null;
  selectedAddressId: string | null;
  selectedPaymentMethodId: string | null;
  selectedTime: string;
}

interface CartContextType {
  items: CartItem[];
  orderType: "pickup" | "delivery";
  storeId: string | null;
  selectedAddressId: string | null;
  selectedPaymentMethodId: string | null;
  selectedTime: string;
  isLoggedIn: boolean;
  addItem: (
    menuItem: MenuItem,
    quantity?: number,
    options?: { [key: string]: string[] },
    specialRequest?: string,
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: "pickup" | "delivery") => void;
  setStoreId: (id: string | null) => void;
  setSelectedAddressId: (id: string | null) => void;
  setSelectedPaymentMethodId: (id: string | null) => void;
  setSelectedTime: (time: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  pointsToEarn: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadPersisted(): Partial<PersistedCart> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersistedCart>;
  } catch {
    return {};
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const { config } = useStorefront();
  const persisted = loadPersisted();

  const [items, setItems] = useState<CartItem[]>(persisted.items ?? []);
  const [orderType, setOrderType] = useState<"pickup" | "delivery">(
    persisted.orderType ?? "pickup",
  );
  const [storeId, setStoreId] = useState<string | null>(
    persisted.storeId ?? null,
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    persisted.selectedAddressId ?? null,
  );
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | null
  >(persisted.selectedPaymentMethodId ?? null);
  const [selectedTime, setSelectedTime] = useState<string>(
    persisted.selectedTime ?? "ASAP",
  );

  // Persist on every change
  useEffect(() => {
    const snapshot: PersistedCart = {
      items,
      orderType,
      storeId,
      selectedAddressId,
      selectedPaymentMethodId,
      selectedTime,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // ignore quota errors
    }
  }, [
    items,
    orderType,
    storeId,
    selectedAddressId,
    selectedPaymentMethodId,
    selectedTime,
  ]);

  const addItem = useCallback(
    (
      menuItem: MenuItem,
      quantity = 1,
      selectedOptions?: { [key: string]: string[] },
      specialRequest?: string,
    ) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.menuItem.id === menuItem.id &&
            JSON.stringify(item.selectedOptions) ===
              JSON.stringify(selectedOptions),
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex].quantity += quantity;
          return updated;
        }
        return [
          ...prev,
          {
            id: `${menuItem.id}-${Date.now()}`,
            menuItem,
            quantity,
            selectedOptions,
            specialRequest,
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId);
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      computeLineUnitPrice(item.menuItem, item.selectedOptions) * item.quantity,
    0,
  );
  const taxRate = Number(config?.taxRate ?? 0.075);
  const pointsPerNaira = Number(config?.pointsPerNaira ?? 0.1);
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;
  const pointsToEarn = Math.floor(subtotal * pointsPerNaira);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        orderType,
        storeId,
        selectedAddressId,
        selectedPaymentMethodId,
        selectedTime,
        isLoggedIn: isAuthenticated,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setOrderType,
        setStoreId,
        setSelectedAddressId,
        setSelectedPaymentMethodId,
        setSelectedTime,
        subtotal,
        tax,
        total,
        pointsToEarn,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
