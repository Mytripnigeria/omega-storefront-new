import { MenuItem } from '@/types/menu';
import { MenuItemCard } from './MenuItemCard';
import { categories } from '@/data/menuData';

interface MenuSectionProps {
  categoryId: string;
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export const MenuSection = ({ categoryId, items, onItemClick, onQuickAdd }: MenuSectionProps) => {
  const category = categories.find(c => c.id === categoryId);
  
  if (!category || items.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold mb-2 px-4">
        {category.name} {category.emoji}
      </h2>
      
      <div className="px-4">
        {items.map(item => (
          <MenuItemCard
            key={item.id}
            item={item}
            onClick={() => onItemClick(item)}
            onQuickAdd={() => onQuickAdd(item)}
          />
        ))}
      </div>
    </section>
  );
};
