import { Plus } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  variant?: 'grid' | 'list';
  onClick: () => void;
  onQuickAdd: () => void;
}

export const MenuItemCard = ({ item, variant = 'grid', onClick, onQuickAdd }: MenuItemCardProps) => {
  if (variant === 'list') {
    return (
      <div 
        className="flex gap-4 p-4 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base mb-1">{item.name}</h3>
          <p className="text-lg font-bold text-foreground mb-2">${item.price.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
        <div className="relative flex-shrink-0">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-28 h-28 object-cover rounded-xl"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-card shadow-card-hover flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-shadow overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {item.popular && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-lg">
            Popular
          </span>
        )}
        {item.newRelease && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg">
            New
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd();
          }}
          className="absolute bottom-2 right-2 w-10 h-10 rounded-xl bg-card/95 backdrop-blur-sm shadow-card-hover flex items-center justify-center hover:bg-card transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm mb-1 line-clamp-1">{item.name}</h3>
        <p className="text-base font-bold text-foreground">${item.price.toFixed(2)}</p>
      </div>
    </div>
  );
};
