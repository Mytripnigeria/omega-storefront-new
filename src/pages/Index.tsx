import { useState, useMemo, useRef, useEffect } from 'react';
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
import { FeaturedBanner } from '@/components/FeaturedBanner';
import { DesktopCartSummary } from '@/components/DesktopCartSummary';
import { Footer } from '@/components/Footer';
import { PageTransition } from '@/components/PageTransition';
import { BannerSkeleton, MenuSectionSkeleton } from '@/components/skeletons';
import { useSkeletonLoader } from '@/hooks/useSkeletonLoader';
import { menuItems, categories } from '@/data/menuData';
import { useCart } from '@/context/CartContext';
import { MenuItem } from '@/types/menu';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const Index = () => {
  const navigate = useNavigate();
  const { addItem, isLoggedIn } = useCart();
  const isLoading = useSkeletonLoader(1500);

  const [activeCategory, setActiveCategory] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemSheetOpen, setIsItemSheetOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const groupedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matches = (item: MenuItem) =>
      q.length === 0 ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    const groups: { [key: string]: MenuItem[] } = {};

    // Popular
    groups['popular'] = menuItems.filter(item => item.popular).filter(matches);

    // New
    groups['new'] = menuItems.filter(item => item.newRelease).filter(matches);

    // By category
    categories.filter(c => c.id !== 'popular' && c.id !== 'new').forEach(cat => {
      groups[cat.id] = menuItems.filter(item => item.category === cat.id).filter(matches);
    });

    return groups;
  }, [searchQuery]);

  // Intersection observer for sticky category scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.getAttribute('data-category');
            if (categoryId) {
              setActiveCategory(categoryId);
            }
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
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
      <div className="min-h-screen bg-background pb-32 lg:pb-8">
        {/* Hero Section with Logo */}
        <div className="px-4 pt-6 pb-4 max-w-7xl mx-auto lg:px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Toasty" className="h-14 w-auto" />
              <div>
                <div className="flex items-center gap-1 text-sm text-success mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Open · Closes 10pm</span>
                </div>
              </div>
            </div>
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
                
                return (
                  <section
                    key={category.id}
                    ref={(el) => (sectionRefs.current[category.id] = el)}
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

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
