import { ArrowLeft, User, CreditCard, History, Settings, LogOut, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useCart();

  const profileMenuItems = [
    { icon: History, label: 'Order History', onClick: () => navigate('/order-history') },
    { icon: CreditCard, label: 'Payment Methods', onClick: () => {} },
    { icon: Star, label: 'Rewards & Points', onClick: () => {} },
    { icon: Settings, label: 'Settings', onClick: () => {} },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center h-14 px-4 max-w-7xl mx-auto lg:px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold ml-4">Profile</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Desktop: Two-column layout */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left Column: Profile Info */}
          <div>
            {/* Profile Card */}
            <div className="flex items-center gap-4 p-4 lg:p-6 bg-card rounded-2xl border border-border mb-6">
              <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold lg:text-xl">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                Edit
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 lg:p-6 bg-card rounded-2xl border border-border text-center">
                <p className="text-2xl lg:text-3xl font-bold">{user.loyaltyPoints.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Points</p>
              </div>
              <div className="p-4 lg:p-6 bg-card rounded-2xl border border-border text-center">
                <p className="text-2xl lg:text-3xl font-bold">₦{user.walletBalance.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Wallet</p>
              </div>
            </div>
          </div>

          {/* Right Column: Menu & Actions */}
          <div>
            {/* Menu */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {profileMenuItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors ${
                    index !== profileMenuItems.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>

            {/* Logout */}
            <button className="w-full flex items-center justify-center gap-2 p-4 mt-6 text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
