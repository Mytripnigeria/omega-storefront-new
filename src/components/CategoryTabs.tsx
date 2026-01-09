import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { categories, menuItems } from '@/data/menuData';
import { cn } from '@/lib/utils';
import { MenuItem } from '@/types/menu';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onSearchClick: () => void;
  onItemClick?: (item: MenuItem) => void;
}

export const CategoryTabs = ({ activeCategory, onCategoryChange, onItemClick }: CategoryTabsProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll active category into view
  useEffect(() => {
    if (activeButtonRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      
      const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const filteredItems = searchQuery.trim()
    ? menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="sticky top-0 z-30 bg-card border-b border-border">
      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="absolute inset-x-0 top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <button
              onClick={handleSearchClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="max-h-80 overflow-y-auto border-t border-border">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No items found for "{searchQuery}"
                </div>
              ) : (
                <div className="py-2">
                  {filteredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onItemClick?.(item);
                        handleSearchClose();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                    >
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                      <span className="font-semibold text-sm flex-shrink-0">₦{item.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 py-2">
        {/* Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex-shrink-0 w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Category Pills */}
        {categories.map((category) => (
          <button
            key={category.id}
            ref={activeCategory === category.id ? activeButtonRef : null}
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
