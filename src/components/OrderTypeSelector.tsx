import { MapPin, Clock, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface OrderTypeSelectorProps {
  onLocationClick: () => void;
}

export const OrderTypeSelector = ({ onLocationClick }: OrderTypeSelectorProps) => {
  const { orderType, setOrderType, selectedLocation } = useCart();

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      {/* Toggle */}
      <div className="flex bg-secondary rounded-xl p-1 mb-4">
        <button
          onClick={() => setOrderType('pickup')}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all",
            orderType === 'pickup' 
              ? "bg-card text-foreground shadow-sm" 
              : "text-muted-foreground"
          )}
        >
          Pickup
        </button>
        <button
          onClick={() => setOrderType('delivery')}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all",
            orderType === 'delivery' 
              ? "bg-card text-foreground shadow-sm" 
              : "text-muted-foreground"
          )}
        >
          Delivery
        </button>
      </div>

      {/* Location/Address Row */}
      <div className="flex gap-3">
        <button
          onClick={onLocationClick}
          className="flex-1 flex items-center gap-2 px-4 py-3 bg-secondary rounded-xl text-left hover:bg-secondary/80 transition-colors"
        >
          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {orderType === 'pickup' ? selectedLocation : 'Enter address...'}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
        </button>

        <button className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">ASAP</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
