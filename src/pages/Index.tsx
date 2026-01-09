import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { OrderTypeSelector } from '@/components/OrderTypeSelector';
import { CategoryTabs } from '@/components/CategoryTabs';
import { MenuSection } from '@/components/MenuSection';
import { ItemDetailSheet } from '@/components/ItemDetailSheet';
import { CartSheet } from '@/components/CartSheet';
import { WalletSheet } from '@/components/WalletSheet';
import { LocationSheet } from '@/components/LocationSheet';
import { BottomCTA } from '@/components/BottomCTA';
import { menuItems, categories } from '@/data/menuData';
import { useCart } from '@/context/CartContext';
import { MenuItem } from '@/types/menu';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [activeCategory, setActiveCategory] = useState('popular');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemSheetOpen, setIsItemSheetOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'popular') {
      return menuItems.filter(item => item.popular);
    }
    if (activeCategory === 'new') {
      return menuItems.filter(item => item.newRelease);
    }
    return menuItems.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsItemSheetOpen(true);
  };

  const handleQuickAdd = (item: MenuItem) => {
    addItem(item);
    toast.success(`${item.name} added to cart`, {
      description: `$${item.price.toFixed(2)}`,
      duration: 2000,
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
      />

      <div className="container py-4 px-4">
        <OrderTypeSelector onLocationClick={() => setIsLocationOpen(true)} />
      </div>

      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onSearchClick={() => {}}
      />

      <main className="pt-4 pb-8">
        <MenuSection
          categoryId={activeCategory}
          items={filteredItems}
          onItemClick={handleItemClick}
          onQuickAdd={handleQuickAdd}
        />
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
    </div>
  );
};

export default Index;
