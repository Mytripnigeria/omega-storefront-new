import { Plus } from 'lucide-react';
import { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: () => void;
  onQuickAdd: () => void;
}

export const MenuItemCard = ({ item, onClick, onQuickAdd }: MenuItemCardProps) => {
  return (
    <div 
      className="flex gap-4 py-4 border-b border-border last:border-0 cursor-pointer hover:bg-secondary/30 transition-colors -mx-4 px-4"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-semibold text-base text-foreground mb-1">{item.name}</h3>
        <p className="text-base font-semibold text-foreground mb-1">${item.price.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
      </div>
      <div className="relative flex-shrink-0">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd();
          }}
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
