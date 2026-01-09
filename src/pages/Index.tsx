import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Clock, History, Star } from 'lucide-react';
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
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { addItem, itemCount, user } = useCart();
  
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

      {/* Title Section */}
      <div className="container px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold">QuickBite Menu</h1>
            <div className="flex items-center gap-1 text-sm text-success">
              <Clock className="w-3.5 h-3.5" />
              <span>Open now</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/order-history')}
              className="relative"
            >
              <History className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsWalletOpen(true)}
              className="relative"
            >
              <Star className="w-5 h-5 text-accent" />
              <span className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                {user.loyaltyPoints > 999 ? '1k+' : user.loyaltyPoints}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>

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
