import { useEffect } from 'react';
import { X, Minus, Plus, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { menuItems } from '@/data/menuData';
import { MenuItem } from '@/types/menu';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useHaptics } from '@/hooks/useHaptics';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSheet = ({ isOpen, onClose, onCheckout }: CartSheetProps) => {
  useBodyScrollLock(isOpen);
  const { triggerHaptic } = useHaptics();
  
  // Trigger haptic on open/close
  useEffect(() => {
    if (isOpen) {
      triggerHaptic('medium');
    }
  }, [isOpen, triggerHaptic]);
  
  const { 
    items, 
    updateQuantity,
    addItem,
    subtotal, 
    pointsToEarn 
  } = useCart();

  // Get suggested items (random items not in cart)
  const cartItemIds = items.map(item => item.menuItem.id);
  const suggestedItems = menuItems
    .filter(item => !cartItemIds.includes(item.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const handleQuickAdd = (item: MenuItem) => {
    addItem(item);
    toast.success(`${item.name} added`);
  };

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-foreground/50 z-50 safari-fix"
            onClick={handleClose}
          />

          {/* Sheet - Bottom sheet on mobile, centered dialog on desktop */}
          <motion.div 
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-50 bg-card shadow-none border border-border flex flex-col safari-fix",
              "inset-x-0 bottom-0 rounded-t-3xl h-[85vh] max-h-[85vh]",
              "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:w-full lg:max-w-md lg:h-auto lg:max-h-[80vh]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-3 border-b border-border">
              <h2 className="text-lg font-bold">Cart ({items.length})</h2>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
                <span className="text-2xl">🛒</span>
              </div>
              <p className="text-muted-foreground text-sm">Your cart is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Add items to get started</p>
            </div>
          ) : (
            <div className="px-5 py-3 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img 
                    src={item.menuItem.image} 
                    alt={item.menuItem.name}
                    className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.menuItem.name}</h3>
                    {/* Show selected options as sub-list with prices */}
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {Object.entries(item.selectedOptions).map(([optionId, choices]) => {
                          const option = item.menuItem.options?.find(o => o.id === optionId);
                          return choices.map((choiceId) => {
                            const choice = option?.choices.find(c => c.id === choiceId);
                            if (!choice) return null;
                            return (
                              <div key={`${optionId}-${choiceId}`} className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                                  {choice.name}
                                </span>
                                {choice.price && choice.price > 0 && (
                                  <span>+₦{choice.price.toLocaleString()}</span>
                                )}
                              </div>
                            );
                          });
                        })}
                      </div>
                    )}
                    {item.specialRequest && (
                      <p className="text-xs text-muted-foreground italic mt-1 truncate">"{item.specialRequest}"</p>
                    )}
                    <p className="text-sm font-bold mt-1">₦{(item.menuItem.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center bg-secondary rounded-full h-8">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-l-full transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-r-full transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggested Items */}
          {items.length > 0 && suggestedItems.length > 0 && (
            <div className="px-5 py-4 border-t border-border">
              <h3 className="font-semibold text-sm mb-3">You might also like</h3>
              <div className="space-y-2">
                {suggestedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">₦{item.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleQuickAdd(item)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        {items.length > 0 && (
          <div className="flex-shrink-0 p-5 pt-3 border-t border-border space-y-3 safe-bottom-pad">
            {/* Points Banner */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary rounded-xl">
              <Star className="w-4 h-4" />
              <span className="text-sm">
                Earn <strong>{pointsToEarn} points</strong> with this order
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
              className="w-full h-12 text-base font-semibold rounded-full"
              size="lg"
            >
              Go to checkout
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
