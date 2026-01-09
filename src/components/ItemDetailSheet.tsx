import { useState, useMemo } from 'react';
import { X, Minus, Plus, ChevronRight, Check } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { menuItems } from '@/data/menuData';
import { toast } from 'sonner';

interface ItemDetailSheetProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemDetailSheet = ({ item, isOpen, onClose }: ItemDetailSheetProps) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string[] }>({});
  const [specialRequest, setSpecialRequest] = useState('');

  // Get upsell items (same category or random)
  const upsellItems = useMemo(() => {
    if (!item) return [];
    return menuItems
      .filter(i => i.id !== item.id && i.category === item.category)
      .slice(0, 3);
  }, [item]);

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
    addItem(item, quantity, selectedOptions, specialRequest);
    setQuantity(1);
    setSelectedOptions({});
    setSpecialRequest('');
    onClose();
  };

  const handleQuickAdd = (upsellItem: MenuItem) => {
    addItem(upsellItem);
    toast.success(`${upsellItem.name} added`);
  };

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
          "fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-modal transition-transform duration-300 max-h-[90vh] overflow-hidden flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Image Header */}
        <div className="relative h-48 sm:h-56 flex-shrink-0">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="text-xl font-bold">{item.name}</h2>
              <span className="font-bold text-lg flex-shrink-0">₦{item.price.toLocaleString()}</span>
            </div>
            <p className="text-muted-foreground text-sm mb-5">{item.description}</p>

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
                          ? "border-foreground bg-secondary" 
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
                        <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                          <Check className="w-3 h-3 text-background" />
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
        <div className="flex-shrink-0 p-4 border-t border-border bg-card safe-bottom">
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
      </div>
    </>
  );
};
