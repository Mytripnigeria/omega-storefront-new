import { Plus } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { useHaptics } from '@/hooks/useHaptics';
import { motion } from 'framer-motion';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: () => void;
  onQuickAdd: () => void;
}

export const MenuItemCard = ({ item, onClick, onQuickAdd }: MenuItemCardProps) => {
  const { triggerHaptic } = useHaptics();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    onQuickAdd();
  };

  const handleClick = () => {
    triggerHaptic('light');
    onClick();
  };

  return (
    <motion.div 
      className="flex gap-4 py-4 border-b border-border last:border-0 cursor-pointer hover:bg-secondary/30 transition-colors -mx-4 px-4"
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-semibold text-base text-foreground mb-1">{item.name}</h3>
        <p className="text-base font-semibold text-foreground mb-1">₦{item.price.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
      </div>
      <div className="relative flex-shrink-0">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <motion.button
          onClick={handleQuickAdd}
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.1 }}
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};
