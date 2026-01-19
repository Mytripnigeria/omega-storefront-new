import { Minus, Plus, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

interface DesktopCartSummaryProps {
  onCheckout: () => void;
}

export const DesktopCartSummary = ({ onCheckout }: DesktopCartSummaryProps) => {
  const { 
    items, 
    updateQuantity,
    subtotal, 
    pointsToEarn 
  } = useCart();

  return (
    <div className="hidden lg:block sticky top-20 h-fit will-change-transform">
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Order
          </h2>
        </div>

        {/* Cart Items */}
        <div className="max-h-[400px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
                <span className="text-2xl">🛒</span>
              </div>
              <p className="text-muted-foreground text-sm">Your cart is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Add items to get started</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img 
                    src={item.menuItem.image} 
                    alt={item.menuItem.name}
                    className="w-12 h-12 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.menuItem.name}</h3>
                    <p className="text-sm font-bold mt-0.5">₦{(item.menuItem.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center bg-secondary rounded-full h-8">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-l-full transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-semibold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-r-full transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        {items.length > 0 && (
          <div className="p-4 border-t border-border space-y-3">
            {/* Points Banner */}
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-xl">
              <Star className="w-4 h-4" />
              <span className="text-sm">
                Earn <strong>{pointsToEarn} points</strong>
              </span>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold">₦{subtotal.toLocaleString()}</span>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={onCheckout}
              className="w-full h-11 text-base font-semibold rounded-full"
              size="lg"
            >
              Checkout
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
