import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { OrderTypeSelector } from '@/components/OrderTypeSelector';
import { CategoryTabs } from '@/components/CategoryTabs';
import { MenuSection } from '@/components/MenuSection';
import { ItemDetailSheet } from '@/components/ItemDetailSheet';
import { CartSheet } from '@/components/CartSheet';
import { WalletSheet } from '@/components/WalletSheet';
import { LocationSheet } from '@/components/LocationSheet';
import { TimePickerSheet } from '@/components/TimePickerSheet';
import { SignInSheet } from '@/components/SignInSheet';
import { StoreInfoSheet } from '@/components/StoreInfoSheet';
import { FeaturedBanner } from '@/components/FeaturedBanner';
import { DesktopCartSummary } from '@/components/DesktopCartSummary';
import { Footer } from '@/components/Footer';
import { PageTransition } from '@/components/PageTransition';
import { PullToRefresh } from '@/components/PullToRefresh';
import { BannerSkeleton, MenuSectionSkeleton } from '@/components/skeletons';
import { useSkeletonLoader } from '@/hooks/useSkeletonLoader';
import { menuItems, categories, comboItems } from '@/data/menuData';
import { ComboItemCard } from '@/components/ComboItemCard';
import { useCart } from '@/context/CartContext';
import { MenuItem } from '@/types/menu';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const Index = () => {
  const navigate = useNavigate();
  const { addItem, isLoggedIn } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  // Initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate refresh - in real app, this would refetch data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success('Menu refreshed');
  }, []);

  const [activeCategory, setActiveCategory] = useState('combos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemSheetOpen, setIsItemSheetOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isStoreInfoOpen, setIsStoreInfoOpen] = useState(false);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  const groupedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matches = (item: MenuItem) =>
      q.length === 0 ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    const groups: { [key: string]: MenuItem[] } = {};

    // Combos
    groups['combos'] = comboItems.filter(matches);

    // Popular
    groups['popular'] = menuItems.filter(item => item.popular).filter(matches);

    // New
    groups['new'] = menuItems.filter(item => item.newRelease).filter(matches);

    // By category
    categories.filter(c => c.id !== 'popular' && c.id !== 'new' && c.id !== 'combos').forEach(cat => {
      groups[cat.id] = menuItems.filter(item => item.category === cat.id).filter(matches);
    });

    return groups;
  }, [searchQuery]);

  // Keep activeCategory in sync with scroll position (even when sections mount later)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.getAttribute('data-category');
            if (categoryId) setActiveCategory(categoryId);
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );

    observerRef.current = observer;

    // Observe anything already mounted
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    const section = sectionRefs.current[categoryId];
    if (section) {
      const headerOffset = 120;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsItemSheetOpen(true);
  };

  const handleQuickAdd = (item: MenuItem) => {
    addItem(item);
    toast.success(`${item.name} added to cart`, {
      duration: 1500,
    });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <PageTransition>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="min-h-screen bg-background pb-28">
        {/* Hero Section with Logo */}
        <div className="px-4 pt-6 pb-4 max-w-7xl mx-auto lg:px-6">
          <div className="mb-4">
            <img src={logo} alt="Mr. Jollof" className="h-14 w-auto mb-2" />
            <button 
              onClick={() => setIsStoreInfoOpen(true)}
              className="flex items-center gap-1 text-sm text-success hover:text-success/80 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Open · Closes 10pm</span>
            </button>
          </div>

          <OrderTypeSelector 
            onLocationClick={() => setIsLocationOpen(true)} 
            onTimeClick={() => setIsTimePickerOpen(true)}
          />
        </div>

        {/* Featured Banner */}
        {isLoading ? <BannerSkeleton /> : <FeaturedBanner />}

        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />

        {/* Menu Content - Two column layout on desktop */}
        <div className="max-w-7xl mx-auto lg:flex lg:gap-8 lg:px-6">
          {/* Menu Sections */}
          <main className="pt-4 pb-8 flex-1 lg:pt-6">
            {isLoading ? (
              <>
                <MenuSectionSkeleton />
                <MenuSectionSkeleton />
              </>
            ) : (
              categories.map(category => {
                const items = groupedItems[category.id] || [];
                if (items.length === 0) return null;
                
                // Special rendering for combos
                if (category.id === 'combos') {
                  return (
                    <section
                      key={category.id}
                      ref={(el) => {
                        const prev = sectionRefs.current[category.id];
                        if (prev && observerRef.current) observerRef.current.unobserve(prev);
                        sectionRefs.current[category.id] = el;
                        if (el && observerRef.current) observerRef.current.observe(el);
                      }}
                      data-category={category.id}
                      className="mb-6 px-4 lg:px-0"
                    >
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>{category.emoji}</span>
                        <span>{category.name}</span>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map(item => (
                          <ComboItemCard
                            key={item.id}
                            item={item}
                            onItemClick={handleItemClick}
                            onQuickAdd={handleQuickAdd}
                          />
                        ))}
                      </div>
                    </section>
                  );
                }
                
                return (
                  <section
                    key={category.id}
                    ref={(el) => {
                      const prev = sectionRefs.current[category.id];
                      if (prev && observerRef.current) observerRef.current.unobserve(prev);
                      sectionRefs.current[category.id] = el;
                      if (el && observerRef.current) observerRef.current.observe(el);
                    }}
                    data-category={category.id}
                    className="mb-6"
                  >
                    <MenuSection
                      categoryId={category.id}
                      items={items}
                      onItemClick={handleItemClick}
                      onQuickAdd={handleQuickAdd}
                    />
                  </section>
                );
              })
            )}
          </main>

          {/* Desktop Cart Summary - aligned with category tabs */}
          <aside className="hidden lg:block w-80 pt-6 flex-shrink-0">
            <DesktopCartSummary onCheckout={handleCheckout} />
          </aside>
        </div>

        <BottomNav 
          onCartClick={() => setIsCartOpen(true)}
          onWalletClick={() => setIsWalletOpen(true)}
          onSignInClick={() => setIsSignInOpen(true)}
          isLoggedIn={isLoggedIn}
        />

        <ItemDetailSheet
          item={selectedItem}
          isOpen={isItemSheetOpen}
          onClose={() => setIsItemSheetOpen(false)}
        />

        <CartSheet
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
        />

        <WalletSheet
          isOpen={isWalletOpen}
          onClose={() => setIsWalletOpen(false)}
        />

        <LocationSheet
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
        />

        <TimePickerSheet
          isOpen={isTimePickerOpen}
          onClose={() => setIsTimePickerOpen(false)}
        />

        <SignInSheet
          isOpen={isSignInOpen}
          onClose={() => setIsSignInOpen(false)}
        />

        <StoreInfoSheet
          isOpen={isStoreInfoOpen}
          onClose={() => setIsStoreInfoOpen(false)}
        />

        <Footer />
      </div>
      </PullToRefresh>
    </PageTransition>
  );
};

export default Index;
