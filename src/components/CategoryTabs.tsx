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
    <div className="sticky top-14 z-30 bg-card border-b border-border">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 py-2">
        {/* Search Button */}
        <button
          onClick={onSearchClick}
          className="flex-shrink-0 w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Category Pills */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              activeCategory === category.id
                ? "bg-foreground text-background"
                : "border border-border text-foreground hover:bg-secondary"
            )}
          >
            {category.name} {category.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
