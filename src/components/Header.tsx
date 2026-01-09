import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, History, Moon, Sun, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

interface HeaderProps {
  onCartClick: () => void;
  onWalletClick: () => void;
  onSignInClick: () => void;
  isLoggedIn?: boolean;
}

export const Header = ({ onCartClick, onWalletClick, onSignInClick, isLoggedIn }: HeaderProps) => {
  const navigate = useNavigate();
  const { itemCount, user } = useCart();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
            <span className="text-background text-sm font-bold">MJ</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Mr. Jollof</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9"
          >
            {theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/order-history')}
            className="w-9 h-9"
          >
            <History className="w-[18px] h-[18px]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onWalletClick}
            className="relative w-9 h-9"
          >
            <Star className="w-[18px] h-[18px]" />
            {user.loyaltyPoints > 0 && (
              <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[16px] h-4 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                {user.loyaltyPoints > 999 ? '1k' : user.loyaltyPoints}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onCartClick}
            className="relative w-9 h-9"
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={isLoggedIn ? () => navigate('/profile') : onSignInClick}
            className="w-9 h-9"
          >
            <User className="w-[18px] h-[18px]" />
          </Button>
        </div>
      </div>
    </header>
  );
};
