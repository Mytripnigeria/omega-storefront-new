import { MapPin, Clock, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useMenu } from "@/context/MenuContext";
import { cn } from "@/lib/utils";

interface OrderTypeSelectorProps {
  onLocationClick: () => void;
  onTimeClick: () => void;
}

export const OrderTypeSelector = ({
  onLocationClick,
  onTimeClick,
}: OrderTypeSelectorProps) => {
  const {
    orderType,
    setOrderType,
    storeId,
    selectedAddressId,
    selectedTime,
  } = useCart();
  const { stores } = useMenu();

  const store = stores.find((s) => s.id === storeId) ?? null;
  const locationLabel =
    orderType === "pickup"
      ? store?.name ?? "Choose a store..."
      : selectedAddressId
        ? "Saved address"
        : "Enter address...";

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex bg-secondary rounded-full p-1">
        <button
          onClick={() => setOrderType("pickup")}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-full font-medium text-sm transition-all",
            orderType === "pickup"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Pickup
        </button>
        <button
          onClick={() => setOrderType("delivery")}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-full font-medium text-sm transition-all",
            orderType === "delivery"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Delivery
        </button>
      </div>

      {/* Location/Address & Time Row */}
      <div className="flex gap-2">
        <button
          onClick={onLocationClick}
          className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-secondary rounded-full text-left hover:bg-secondary/80 transition-colors"
        >
          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">{locationLabel}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
        </button>

        <button
          onClick={onTimeClick}
          className="flex items-center gap-2 px-3 py-2.5 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
        >
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{selectedTime || "ASAP"}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
