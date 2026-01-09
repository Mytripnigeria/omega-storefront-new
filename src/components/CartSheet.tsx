import { X, Minus, Plus, ChevronRight, Clock, MapPin, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSheet = ({ isOpen, onClose, onCheckout }: CartSheetProps) => {
  const { 
    items, 
    updateQuantity, 
    removeItem,
    orderType, 
    setOrderType,
    selectedLocation,
    subtotal, 
    pointsToEarn 
  } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-foreground/40 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-modal transition-transform duration-300 max-h-[85vh] flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
          <h2 className="text-xl font-bold">Cart</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Type Toggle */}
        <div className="px-6 py-4">
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

          {/* Location & Time */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center gap-2 px-4 py-3 bg-secondary rounded-xl text-left">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate">{selectedLocation}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-xl">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">ASAP (10 min)</span>
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <img 
                    src={item.menuItem.image} 
                    alt={item.menuItem.name}
                    className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm">{item.menuItem.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center bg-secondary rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-l-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-r-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        {items.length > 0 && (
          <div className="flex-shrink-0 p-6 pt-4 border-t border-border space-y-4">
            {/* Points Banner */}
            <div className="flex items-center gap-2 px-4 py-3 gradient-points rounded-xl text-accent-foreground">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-semibold">
                You'll earn <strong>{pointsToEarn} points</strong> with this order
              </span>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold">Subtotal</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={onCheckout}
              className="w-full h-14 text-lg font-bold"
              size="lg"
            >
              Go to checkout
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
