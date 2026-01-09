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

  // Use grid for popular/new, list for others
  const useGrid = categoryId === 'popular' || categoryId === 'new';

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4 px-4">
        {category.name} {category.emoji}
      </h2>
      
      {useGrid ? (
        <div className="grid grid-cols-2 gap-3 px-4">
          {items.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              variant="grid"
              onClick={() => onItemClick(item)}
              onQuickAdd={() => onQuickAdd(item)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4">
          {items.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              variant="list"
              onClick={() => onItemClick(item)}
              onQuickAdd={() => onQuickAdd(item)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
