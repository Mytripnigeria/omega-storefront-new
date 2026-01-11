import { useState } from 'react';
import { X, Star, Wallet, ChevronRight, Gift, TrendingUp, Copy, Check, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WalletSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = 'main' | 'addFunds' | 'history' | 'redeem';

const mockHistory = [
  { id: '1', type: 'credit', amount: 5000, description: 'Bank Transfer', date: '2024-01-08', status: 'completed' },
  { id: '2', type: 'points', amount: 150, description: 'Order #1234 Points', date: '2024-01-07', status: 'completed' },
  { id: '3', type: 'credit', amount: 2000, description: 'Bank Transfer', date: '2024-01-05', status: 'completed' },
  { id: '4', type: 'points', amount: 80, description: 'Order #1230 Points', date: '2024-01-04', status: 'completed' },
  { id: '5', type: 'debit', amount: -1500, description: 'Order #1231 Payment', date: '2024-01-03', status: 'completed' },
];

const tierColors = {
  bronze: 'bg-foreground',
  silver: 'bg-foreground',
  gold: 'bg-foreground',
  platinum: 'bg-foreground',
};

const tierNextPoints = {
  bronze: 500,
  silver: 1500,
  gold: 3000,
  platinum: Infinity,
};

export const WalletSheet = ({ isOpen, onClose }: WalletSheetProps) => {
  const { user } = useCart();
  const [view, setView] = useState<View>('main');
  const [copied, setCopied] = useState(false);
  
  const nextTier = user.tier === 'platinum' ? null : (
    user.tier === 'bronze' ? 'Silver' :
    user.tier === 'silver' ? 'Gold' : 'Platinum'
  );
  
  const pointsToNext = tierNextPoints[user.tier] - user.loyaltyPoints;
  const progress = user.tier === 'platinum' ? 100 : 
    (user.loyaltyPoints / tierNextPoints[user.tier]) * 100;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setView('main');
    onClose();
  };

  const renderMainView = () => (
    <>
      {/* Wallet Balance Card */}
      <div className="bg-foreground rounded-2xl p-5 text-background mb-4">
        <div className="flex items-center gap-2 mb-3 opacity-80">
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-medium">Wallet Balance</span>
        </div>
        <p className="text-3xl font-bold mb-4">₦{user.walletBalance.toLocaleString()}</p>
        <Button 
          onClick={() => setView('addFunds')}
          variant="secondary" 
          className="w-full bg-background/20 hover:bg-background/30 text-background border-0"
        >
          Add Funds
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Points Card */}
      <div className={cn("rounded-2xl p-5 text-background mb-4", tierColors[user.tier])}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 opacity-80">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">{user.tier}</span>
          </div>
          <span className="text-xs opacity-60">Loyalty Points</span>
        </div>
        <p className="text-3xl font-bold mb-3">{user.loyaltyPoints.toLocaleString()}</p>
        
        {nextTier && (
          <div>
            <div className="flex items-center justify-between text-xs mb-2 opacity-80">
              <span>{pointsToNext} pts to {nextTier}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-background/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-background rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button 
          onClick={() => setView('redeem')}
          className="flex flex-col items-center gap-2 p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
        >
          <Gift className="w-5 h-5" />
          <span className="font-medium text-sm">Redeem Points</span>
        </button>
        <button 
          onClick={() => setView('history')}
          className="flex flex-col items-center gap-2 p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
        >
          <TrendingUp className="w-5 h-5" />
          <span className="font-medium text-sm">View History</span>
        </button>
      </div>

      {/* Rewards Info */}
      <div className="bg-secondary rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-3">How to Earn Points</h3>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-3">
            <span>💰</span>
            <span className="text-muted-foreground">10 pts per ₦100 spent</span>
          </div>
          <div className="flex items-center gap-3">
            <span>🎁</span>
            <span className="text-muted-foreground">500 pts birthday bonus</span>
          </div>
          <div className="flex items-center gap-3">
            <span>👥</span>
            <span className="text-muted-foreground">200 pts per referral</span>
          </div>
        </div>
      </div>
    </>
  );

  const renderAddFundsView = () => (
    <>
      <button
        onClick={() => setView('main')}
        className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h3 className="text-lg font-bold mb-4">Add Funds via Transfer</h3>
      
      <div className="bg-secondary rounded-xl p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Transfer to this account to instantly credit your wallet.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bank</span>
            <span className="font-medium">OPay</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Account Number</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold">8012345678</span>
              <button
                onClick={() => handleCopy('8012345678')}
                className="p-1.5 rounded-lg hover:bg-background transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Account Name</span>
            <span className="font-medium">Mr. Jollof Foods</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Wallet will be credited automatically within 1-3 minutes after transfer.
      </p>
    </>
  );

  const renderHistoryView = () => (
    <>
      <button
        onClick={() => setView('main')}
        className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h3 className="text-lg font-bold mb-4">Transaction History</h3>
      
      <div className="space-y-2">
        {mockHistory.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
            <div>
              <p className="font-medium text-sm">{item.description}</p>
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </div>
            <span className={cn(
              "font-bold text-sm",
              item.type === 'debit' ? 'text-destructive' : 'text-foreground'
            )}>
              {item.type === 'points' ? `+${item.amount} pts` : 
               item.type === 'debit' ? `-₦${Math.abs(item.amount).toLocaleString()}` :
               `+₦${item.amount.toLocaleString()}`}
            </span>
          </div>
        ))}
      </div>
    </>
  );

  const renderRedeemView = () => (
    <>
      <button
        onClick={() => setView('main')}
        className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold mb-2">Redeem Your Points</h3>
        <p className="text-muted-foreground text-sm mb-4">
          You have <strong>{user.loyaltyPoints.toLocaleString()} points</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Order any item and apply your points at checkout to get discounts on your order.
        </p>
        <Button onClick={handleClose} className="mt-6 rounded-full">
          Start Ordering
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-foreground/40 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div 
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-modal transition-transform duration-300 flex flex-col",
          "h-[85vh] max-h-[85vh]",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-bold">Wallet & Rewards</h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {view === 'main' && renderMainView()}
          {view === 'addFunds' && renderAddFundsView()}
          {view === 'history' && renderHistoryView()}
          {view === 'redeem' && renderRedeemView()}
        </div>
      </div>
    </>
  );
};
