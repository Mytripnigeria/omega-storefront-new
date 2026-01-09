import { X, Star, Wallet, ChevronRight, Gift, TrendingUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WalletSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const tierColors = {
  bronze: 'from-amber-600 to-amber-700',
  silver: 'from-gray-400 to-gray-500',
  gold: 'from-yellow-400 to-amber-500',
  platinum: 'from-slate-300 to-slate-400',
};

const tierNextPoints = {
  bronze: 500,
  silver: 1500,
  gold: 3000,
  platinum: Infinity,
};

export const WalletSheet = ({ isOpen, onClose }: WalletSheetProps) => {
  const { user } = useCart();
  
  const nextTier = user.tier === 'platinum' ? null : (
    user.tier === 'bronze' ? 'Silver' :
    user.tier === 'silver' ? 'Gold' : 'Platinum'
  );
  
  const pointsToNext = tierNextPoints[user.tier] - user.loyaltyPoints;
  const progress = user.tier === 'platinum' ? 100 : 
    (user.loyaltyPoints / tierNextPoints[user.tier]) * 100;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-foreground/40 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-modal transition-transform duration-300 max-h-[85vh] flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold">Wallet & Rewards</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Wallet Balance Card */}
          <div className="gradient-wallet rounded-2xl p-6 text-success-foreground mb-6">
            <div className="flex items-center gap-2 mb-4 opacity-90">
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Wallet Balance</span>
            </div>
            <p className="text-4xl font-bold mb-4">${user.walletBalance.toFixed(2)}</p>
            <Button 
              variant="secondary" 
              className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
            >
              Add Funds
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Points Card */}
          <div className={cn(
            "rounded-2xl p-6 text-white mb-6 bg-gradient-to-br",
            tierColors[user.tier]
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-medium capitalize">{user.tier} Member</span>
              </div>
              <span className="text-sm opacity-80">Loyalty Points</span>
            </div>
            <p className="text-4xl font-bold mb-4">{user.loyaltyPoints.toLocaleString()}</p>
            
            {nextTier && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2 opacity-90">
                  <span>{pointsToNext} pts to {nextTier}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex flex-col items-center gap-2 p-4 bg-secondary rounded-2xl hover:bg-secondary/80 transition-colors">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-accent" />
              </div>
              <span className="font-semibold text-sm">Redeem Points</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-secondary rounded-2xl hover:bg-secondary/80 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <span className="font-semibold text-sm">View History</span>
            </button>
          </div>

          {/* Rewards Info */}
          <div className="bg-secondary rounded-2xl p-4">
            <h3 className="font-bold mb-3">How to Earn Points</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">💰</span>
                <div>
                  <p className="font-medium text-sm">Earn 10 pts per $1 spent</p>
                  <p className="text-xs text-muted-foreground">On all orders</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">🎁</span>
                <div>
                  <p className="font-medium text-sm">Birthday Bonus</p>
                  <p className="text-xs text-muted-foreground">500 pts on your special day</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">👥</span>
                <div>
                  <p className="font-medium text-sm">Refer a Friend</p>
                  <p className="text-xs text-muted-foreground">Get 200 pts for each referral</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
