import { ShoppingCart, User, Star, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onCartClick: () => void;
  onWalletClick: () => void;
  onSignInClick: () => void;
  isLoggedIn?: boolean;
}

export const BottomNav = ({ onCartClick, onWalletClick, onSignInClick, isLoggedIn }: BottomNavProps) => {
  const navigate = useNavigate();
  const { itemCount, subtotal, user } = useCart();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 safe-bottom">
      <div className="bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            {/* Icon Buttons */}
            <div className="flex items-center gap-1 bg-card rounded-full p-1 border border-border shadow-card">
              <button
                onClick={onWalletClick}
                className="relative w-11 h-11 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <Star className="w-5 h-5" />
                {user.loyaltyPoints > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 px-1.5 min-w-[18px] h-[18px] rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                    {user.loyaltyPoints > 999 ? '1k' : user.loyaltyPoints}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => navigate('/order-history')}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ClipboardList className="w-5 h-5" />
              </button>
              
              <button
                onClick={isLoggedIn ? () => navigate('/profile') : onSignInClick}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className={cn(
                "flex-1 h-14 rounded-full font-bold text-base flex items-center justify-between px-6 transition-all",
                "bg-foreground text-background hover:bg-foreground/90"
              )}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>{itemCount > 0 ? `View cart (${itemCount})` : 'Start order'}</span>
              </div>
              {itemCount > 0 && (
                <span>₦{subtotal.toLocaleString()}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
