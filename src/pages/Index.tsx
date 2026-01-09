import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Header } from '@/components/Header';
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
import { BottomCTA } from '@/components/BottomCTA';
import { menuItems, categories } from '@/data/menuData';
import { useCart } from '@/context/CartContext';
import { MenuItem } from '@/types/menu';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { addItem, itemCount, isLoggedIn } = useCart();
  
  const [activeCategory, setActiveCategory] = useState('popular');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemSheetOpen, setIsItemSheetOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: MenuItem[] } = {};
    
    // Popular
    groups['popular'] = menuItems.filter(item => item.popular);
    
    // New
    groups['new'] = menuItems.filter(item => item.newRelease);
    
    // By category
    categories.filter(c => c.id !== 'popular' && c.id !== 'new').forEach(cat => {
      groups[cat.id] = menuItems.filter(item => item.category === cat.id);
    });
    
    return groups;
  }, []);

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
    <div className="min-h-screen bg-background pb-24">
      <Header 
        onCartClick={() => setIsCartOpen(true)}
        onWalletClick={() => setIsWalletOpen(true)}
        onSignInClick={() => setIsSignInOpen(true)}
        isLoggedIn={isLoggedIn}
      />

      {/* Hero Section */}
      <div className="px-4 pt-5 pb-3 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mr. Jollof</h1>
            <div className="flex items-center gap-1 text-sm text-success mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Open · Closes 10pm</span>
            </div>
          </div>
        </div>

        <OrderTypeSelector 
          onLocationClick={() => setIsLocationOpen(true)} 
          onTimeClick={() => setIsTimePickerOpen(true)}
        />
      </div>

      {/* Featured Banner */}
      <FeaturedBanner />

      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onSearchClick={() => {}}
        onItemClick={handleItemClick}
      />

      {/* Menu Sections */}
      <main className="pt-4 pb-8 max-w-7xl mx-auto">
        {categories.map(category => {
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
        })}
      </main>

      <BottomCTA onStartOrder={() => setIsCartOpen(true)} />

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
    </div>
  );
};

export default Index;
