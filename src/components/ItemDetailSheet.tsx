import { useState } from 'react';
import { X, Minus, Plus, ChevronRight } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ItemDetailSheetProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemDetailSheet = ({ item, isOpen, onClose }: ItemDetailSheetProps) => {
  const { addItem, user } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string[] }>({});
  const [specialRequest, setSpecialRequest] = useState('');

  if (!item) return null;

  const handleOptionChange = (optionId: string, choiceId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: [choiceId],
    }));
  };

  const calculateTotal = () => {
    let total = item.price * quantity;
    // Add option prices
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
        <div className="relative h-64 flex-shrink-0">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-card"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
            <p className="text-muted-foreground mb-6">{item.description}</p>

            {/* Options */}
            {item.options?.map(option => (
              <div key={option.id} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold">{option.name}</h3>
                  {option.required && (
                    <span className="text-xs text-destructive font-medium">Required</span>
                  )}
                </div>
                <RadioGroup
                  value={selectedOptions[option.id]?.[0] || ''}
                  onValueChange={(value) => handleOptionChange(option.id, value)}
                >
                  {option.choices.map(choice => (
                    <div key={choice.id} className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={choice.id} id={`${option.id}-${choice.id}`} />
                        <Label htmlFor={`${option.id}-${choice.id}`} className="font-medium cursor-pointer">
                          {choice.name}
                        </Label>
                      </div>
                      {choice.price && choice.price > 0 && (
                        <span className="text-sm text-muted-foreground">+${choice.price.toFixed(2)}</span>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            {/* Special Request */}
            <div className="mb-6">
              <h3 className="font-bold mb-1">Special Requests</h3>
              <p className="text-sm text-muted-foreground mb-3">
                We'll try our best to accommodate, but can't guarantee changes that affect pricing.
              </p>
              <Textarea
                placeholder="Add special request..."
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                className="resize-none"
              />
            </div>

            {/* Pay with Points */}
            {user.loyaltyPoints > 0 && (
              <button className="w-full flex items-center justify-between p-4 bg-secondary rounded-xl mb-6">
                <span className="font-medium">Pay with points</span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm">Sign in to use {user.loyaltyPoints.toLocaleString()} pts</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-card">
          <div className="flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-secondary rounded-xl p-1">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-card transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-card transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add Button */}
            <Button
              onClick={handleAddToCart}
              className="flex-1 h-12 text-base font-bold"
              size="lg"
            >
              Add item
              <ChevronRight className="w-5 h-5 ml-1" />
              <span className="ml-auto">${calculateTotal().toFixed(2)}</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
