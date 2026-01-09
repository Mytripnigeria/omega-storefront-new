import { Wallet, ShoppingCart, User, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onCartClick: () => void;
  onWalletClick: () => void;
}

export const Header = ({ onCartClick, onWalletClick }: HeaderProps) => {
  const { user, itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-xl">🍔</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">QuickBite</h1>
            <div className="flex items-center gap-1 text-xs text-success">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Open now
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Loyalty Points Badge */}
          <button 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gradient-points text-accent-foreground text-sm font-semibold shadow-card"
            onClick={onWalletClick}
          >
            <Star className="w-4 h-4 fill-current" />
            <span>{user.loyaltyPoints.toLocaleString()}</span>
          </button>

          {/* Wallet Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onWalletClick}
            className="relative"
          >
            <Wallet className="w-5 h-5" />
          </Button>

          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCartClick}
            className="relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-bounce-in">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
