import { motion } from 'framer-motion';
import { Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/types/menu';
import { useHaptics } from '@/hooks/useHaptics';

interface ComboItemCardProps {
  item: MenuItem;
  onItemClick: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export const ComboItemCard = ({ item, onItemClick, onQuickAdd }: ComboItemCardProps) => {
  const { triggerHaptic } = useHaptics();
  
  const originalTotal = item.comboItems?.reduce((sum, ci) => sum + ci.originalPrice, 0) || 0;
  const savings = originalTotal - item.price;
  const savingsPercent = Math.round((savings / originalTotal) * 100);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    onQuickAdd(item);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all cursor-pointer border border-primary/20"
      onClick={() => {
        triggerHaptic('light');
        onItemClick(item);
      }}
    >
      {/* Image with savings badge */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Savings badge */}
        <div className="absolute top-3 left-3 bg-success text-success-foreground px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Tag className="w-3 h-3" />
          Save {savingsPercent}%
        </div>
      </div>

      <div className="p-4">
        {/* Title and description */}
        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

        {/* Combo items breakdown */}
        <div className="bg-secondary/50 rounded-xl p-3 mb-3 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Includes:</p>
          {item.comboItems?.map((comboItem, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-foreground">{comboItem.name}</span>
              <span className="text-muted-foreground line-through text-xs">
                {formatPrice(comboItem.originalPrice)}
              </span>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-border flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Original Total:</span>
            <span className="text-sm text-muted-foreground line-through">{formatPrice(originalTotal)}</span>
          </div>
        </div>

        {/* Price and add button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary">{formatPrice(item.price)}</span>
            <p className="text-xs text-success font-medium">You save {formatPrice(savings)}</p>
          </div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              size="icon"
              onClick={handleQuickAdd}
              className="h-10 w-10 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
