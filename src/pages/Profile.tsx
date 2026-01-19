import { useState } from 'react';
import { ArrowLeft, User, CreditCard, History, Settings, LogOut, ChevronRight, Star, Copy, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { PageTransition, FadeInSection, StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { ProfileSkeleton } from '@/components/skeletons';
import { useSkeletonLoader } from '@/hooks/useSkeletonLoader';
import { EditProfileSheet } from '@/components/EditProfileSheet';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useCart();
  const isLoading = useSkeletonLoader(1500);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: 'Adaeze Okonkwo',
    email: 'adaeze.okonkwo@gmail.com',
    phone: '+234 812 345 6789',
    address: '15 Admiralty Way, Lekki Phase 1, Lagos',
    dateOfBirth: '1992-06-15',
  });

  const referralLink = `https://toasty.com/ref/${profileData.email?.split('@')[0] || 'user123'}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  const handleShareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Toasty',
          text: 'Get delicious food and more! Use my referral link:',
          url: referralLink,
        });
      } catch (err) {
        handleCopyReferral();
      }
    } else {
      handleCopyReferral();
    }
  };

  const profileMenuItems = [
    { icon: History, label: 'Order History', onClick: () => navigate('/order-history') },
    { icon: CreditCard, label: 'Payment Methods', onClick: () => navigate('/payment-methods') },
    { icon: Star, label: 'Rewards & Points', onClick: () => toast.info('Rewards page coming soon') },
    { icon: Settings, label: 'Settings', onClick: () => navigate('/settings') },
  ];

  if (isLoading) {
    return (
      <PageTransition>
        <ProfileSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-28 lg:pb-8">
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
              <FadeInSection delay={0.1}>
                <div className="flex items-center gap-4 p-4 lg:p-6 bg-card rounded-2xl border border-border mb-6">
                <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold lg:text-xl">{profileData.name}</h2>
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                  <p className="text-xs text-muted-foreground">{profileData.phone}</p>
                </div>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIsEditProfileOpen(true)}>
                    Edit
                  </Button>
                </div>
              </FadeInSection>

              {/* Stats */}
              <FadeInSection delay={0.2}>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 lg:p-6 bg-card rounded-2xl border border-border text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-primary">{user.loyaltyPoints.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Points</p>
                  </div>
                  <div className="p-4 lg:p-6 bg-card rounded-2xl border border-border text-center">
                    <p className="text-2xl lg:text-3xl font-bold">₦{user.walletBalance.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Wallet</p>
                  </div>
                </div>
              </FadeInSection>

              {/* Referral Section */}
              <FadeInSection delay={0.3}>
                <div className="p-4 lg:p-6 bg-card rounded-2xl border border-border mb-6">
                  <h3 className="font-bold mb-2">Refer a Friend</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Share your referral link and earn 500 points for each friend who orders!
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm truncate text-muted-foreground">
                      {referralLink}
                    </div>
                    <Button variant="outline" size="icon" onClick={handleCopyReferral} className="rounded-lg flex-shrink-0">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="icon" onClick={handleShareReferral} className="rounded-lg flex-shrink-0">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </FadeInSection>
            </div>

            {/* Right Column: Menu & Actions */}
            <FadeInSection delay={0.25} direction="right">
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
            </FadeInSection>
          </div>
        </div>
      </div>
      <EditProfileSheet
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        userData={profileData}
        onSave={setProfileData}
      />
    </PageTransition>
  );
};

export default Profile;
