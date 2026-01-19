import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { categories } from '@/data/menuData';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

export const CategoryTabs = ({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchQueryChange,
}: CategoryTabsProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Scroll active category into view
  useEffect(() => {
    if (activeButtonRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = activeButtonRef.current;

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

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    onSearchQueryChange('');
  };

  return (
    <div className="sticky top-0 z-40 bg-background">
      <div className="max-w-7xl mx-auto">
        <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 py-3 lg:px-6">
          {/* Search Button / Input (filters menu items) */}
          <div ref={searchContainerRef} className="relative flex-shrink-0">
            {isSearchOpen ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    placeholder="Search menu..."
                    className="w-48 sm:w-64 h-9 pl-10 pr-4 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  />
                </div>
                <button
                  onClick={handleSearchClose}
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

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
                  : "border border-border text-foreground hover:bg-secondary",
              )}
            >
              {category.name} {category.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
