import { useState, useMemo, useEffect } from 'react';
import { X, Minus, Plus, ChevronRight, Check, Tag, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem } from '@/types/menu';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { menuItems } from '@/data/menuData';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useHaptics } from '@/hooks/useHaptics';

interface ItemDetailSheetProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemDetailSheet = ({ item, isOpen, onClose }: ItemDetailSheetProps) => {
  // All hooks must be called unconditionally - before any early returns
  useBodyScrollLock(isOpen && !!item);
  const { triggerHaptic } = useHaptics();
  
  // Trigger haptic on open
  useEffect(() => {
    if (isOpen && item) {
      triggerHaptic('medium');
    }
  }, [isOpen, item, triggerHaptic]);
  useBodyScrollLock(isOpen && !!item);
  
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string[] }>({});
  const [specialRequest, setSpecialRequest] = useState('');

  // Get upsell items (same category or random)
  const upsellItems = useMemo(() => {
    if (!item || item.isCombo) return [];
    return menuItems
      .filter(i => i.id !== item.id && i.category === item.category)
      .slice(0, 3);
  }, [item]);

  // Combo calculations
  const comboDetails = useMemo(() => {
    if (!item?.isCombo || !item.comboItems) return null;
    const originalTotal = item.comboItems.reduce((sum, ci) => sum + ci.originalPrice, 0);
    const savings = originalTotal - item.price;
    const savingsPercent = Math.round((savings / originalTotal) * 100);
    return { originalTotal, savings, savingsPercent };
  }, [item]);

  // Early return after all hooks
  if (!item) return null;

  const handleOptionChange = (optionId: string, choiceId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: [choiceId],
    }));
  };

  const calculateTotal = () => {
    let total = item.price * quantity;
    Object.entries(selectedOptions).forEach(([optionId, choices]) => {
      const option = item.options?.find(o => o.id === optionId);
      if (option) {
        choices.forEach(choiceId => {
          const choice = option.choices.find(c => c.id === choiceId);
          if (choice?.price) {
            total += choice.price * quantity;
          }
        });
      }
    });
    return total;
  };

  const handleAddToCart = () => {
    triggerHaptic('success');
    addItem(item, quantity, selectedOptions, specialRequest);
    setQuantity(1);
    setSelectedOptions({});
    setSpecialRequest('');
    onClose();
  };

  const handleQuickAdd = (upsellItem: MenuItem) => {
    triggerHaptic('light');
    addItem(upsellItem);
    toast.success(`${upsellItem.name} added`);
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

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

          {/* Sheet */}
          <motion.div 
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-50 bg-card border border-border shadow-none overflow-hidden flex flex-col safari-fix",
              "inset-x-0 bottom-0 rounded-t-3xl h-[85dvh] max-h-[85dvh]",
              "lg:inset-y-4 lg:right-4 lg:left-auto lg:bottom-auto lg:rounded-2xl lg:w-[480px] lg:h-auto lg:max-h-[calc(100vh-2rem)]"
            )}
          >
        {/* Image Header */}
        <div className="relative h-48 sm:h-56 flex-shrink-0">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
            {/* Combo savings badge */}
            {item.isCombo && comboDetails && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-3 left-3 bg-success text-success-foreground px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5"
              >
                <Tag className="w-4 h-4" />
                Save {comboDetails.savingsPercent}%
              </motion.div>
            )}
          
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card flex items-center justify-center active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="text-xl font-bold">{item.name}</h2>
              <div className="text-right flex-shrink-0">
                <span className="font-bold text-lg">{formatPrice(item.price)}</span>
                {item.isCombo && comboDetails && (
                  <p className="text-xs text-muted-foreground line-through">{formatPrice(comboDetails.originalTotal)}</p>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-5">{item.description}</p>

            {/* Combo Items Breakdown */}
            {item.isCombo && item.comboItems && (
              <div className="mb-5 bg-secondary/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">What's Included</h3>
                </div>
                <div className="space-y-2">
                  {item.comboItems.map((comboItem, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-sm">{comboItem.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(comboItem.originalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
                {comboDetails && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-sm font-medium text-success">Your Savings</span>
                    <span className="font-bold text-success">{formatPrice(comboDetails.savings)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Options - Minimalist List Style */}
            {item.options?.map(option => (
              <div key={option.id} className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{option.name}</h3>
                  {option.required && (
                    <span className="text-xs text-muted-foreground">Required</span>
                  )}
                </div>
                <div className="space-y-2">
                  {option.choices.map(choice => (
                    <button
                      key={choice.id}
                      onClick={() => handleOptionChange(option.id, choice.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                        selectedOptions[option.id]?.[0] === choice.id 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:bg-secondary/50"
                      )}
                    >
                      {choice.image && (
                        <img 
                          src={choice.image} 
                          alt={choice.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{choice.name}</p>
                        {choice.price && choice.price > 0 && (
                          <p className="text-xs text-muted-foreground">+₦{choice.price.toLocaleString()}</p>
                        )}
                      </div>
                      {selectedOptions[option.id]?.[0] === choice.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Special Request */}
            <div className="mb-5">
              <h3 className="font-semibold mb-2">Special Requests</h3>
              <Textarea
                placeholder="Any special instructions..."
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                className="resize-none h-20 text-sm"
              />
            </div>

            {/* Upsell Section */}
            {upsellItems.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-3">Goes well with</h3>
                <div className="space-y-2">
                  {upsellItems.map(upsell => (
                    <div key={upsell.id} className="flex items-center gap-3">
                      <img 
                        src={upsell.image} 
                        alt={upsell.name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{upsell.name}</p>
                        <p className="text-xs text-muted-foreground">₦{upsell.price.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => handleQuickAdd(upsell)}
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
        </div>

        {/* Bottom Bar */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-card safe-bottom-pad">
          <div className="flex items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center bg-secondary rounded-full h-11">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-11 h-11 rounded-l-full flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-11 h-11 rounded-r-full flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add Button */}
            <Button
              onClick={handleAddToCart}
              className="flex-1 h-11 text-sm font-semibold rounded-full"
              size="lg"
            >
              Add to cart · ₦{calculateTotal().toLocaleString()}
            </Button>
          </div>
        </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
