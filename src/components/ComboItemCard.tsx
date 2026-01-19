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

  // Get unique item names for display
  const uniqueItems = item.comboItems?.reduce((acc, ci) => {
    const existing = acc.find(i => i.name === ci.name);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: ci.name, count: 1 });
    }
    return acc;
  }, [] as { name: string; count: number }[]) || [];

  const itemsSummary = uniqueItems.map(i => i.count > 1 ? `${i.count}x ${i.name}` : i.name).join(' + ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
      className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all cursor-pointer flex gap-3 p-3 border border-primary/10"
      onClick={() => {
        triggerHaptic('light');
        onItemClick(item);
      }}
    >
      {/* Image with savings badge */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {/* Savings badge */}
        <div className="absolute top-1 left-1 bg-success text-success-foreground px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
          <Tag className="w-2.5 h-2.5" />
          -{savingsPercent}%
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="font-semibold text-sm mb-0.5 truncate">{item.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{itemsSummary}</p>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{formatPrice(item.price)}</span>
            <span className="text-xs text-muted-foreground line-through">{formatPrice(originalTotal)}</span>
          </div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              size="icon"
              onClick={handleQuickAdd}
              className="h-8 w-8 rounded-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
