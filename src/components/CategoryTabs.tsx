import { Search } from 'lucide-react';
import { categories } from '@/data/menuData';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onSearchClick: () => void;
}

export const CategoryTabs = ({ activeCategory, onCategoryChange, onSearchClick }: CategoryTabsProps) => {
  return (
    <div className="sticky top-16 z-30 bg-background py-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4">
        {/* Search Button */}
        <button
          onClick={onSearchClick}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Category Pills */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap",
              activeCategory === category.id
                ? "bg-foreground text-background shadow-card"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            )}
          >
            {category.name} {category.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
