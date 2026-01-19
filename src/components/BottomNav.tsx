import { ShoppingCart, User, Star, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BottomNavProps {
  onCartClick: () => void;
  onWalletClick: () => void;
  onSignInClick: () => void;
  isLoggedIn?: boolean;
}

export const BottomNav = ({ onCartClick, onWalletClick, onSignInClick, isLoggedIn }: BottomNavProps) => {
  const navigate = useNavigate();
  const { itemCount, subtotal, user } = useCart();
  const { triggerHaptic } = useHaptics();

  const handleCartClick = () => {
    triggerHaptic('medium');
    onCartClick();
  };

  const handleNavClick = (action: () => void) => {
    triggerHaptic('selection');
    action();
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 safe-bottom pb-4 px-4 pt-4 bg-background">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {/* Icon Buttons */}
          <div className="flex items-center gap-1 bg-card rounded-full p-1 border border-border shadow-card">
            <motion.button
              onClick={() => handleNavClick(onWalletClick)}
              className="relative w-11 h-11 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
            >
              <Star className="w-5 h-5" />
              {user.loyaltyPoints > 0 && (
                <span className="absolute -top-0.5 -right-0.5 px-1.5 min-w-[18px] h-[18px] rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                  {user.loyaltyPoints > 999 ? '1k' : user.loyaltyPoints}
                </span>
              )}
            </motion.button>
            
            <motion.button
              onClick={() => handleNavClick(() => navigate('/order-history'))}
              className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
            >
              <ClipboardList className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              onClick={() => handleNavClick(isLoggedIn ? () => navigate('/profile') : onSignInClick)}
              className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
            >
              <User className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Cart Button */}
          <motion.button
            onClick={handleCartClick}
            className={cn(
              "flex-1 h-14 rounded-full font-bold text-base flex items-center justify-between px-6 transition-all shadow-lg",
              "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>{itemCount > 0 ? `View cart (${itemCount})` : 'Start order'}</span>
            </div>
            {itemCount > 0 && (
              <span>₦{subtotal.toLocaleString()}</span>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
