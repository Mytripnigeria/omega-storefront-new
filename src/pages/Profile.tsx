import { useState } from "react";
import {
  ArrowLeft,
  User,
  CreditCard,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Copy,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  PageTransition,
  FadeInSection,
} from "@/components/PageTransition";
import { ProfileSkeleton } from "@/components/skeletons";
import { EditProfileSheet } from "@/components/EditProfileSheet";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { profile, isLoading, isAuthenticated, logout, refreshProfile } =
    useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  if (isLoading) {
    return (
      <PageTransition>
        <ProfileSkeleton />
      </PageTransition>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <User className="w-12 h-12 text-muted-foreground mb-3" />
          <h1 className="text-lg font-bold mb-1">Sign in to view profile</h1>
          <Button onClick={() => navigate("/login")} className="mt-2">
            Sign in
          </Button>
        </div>
      </PageTransition>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const referralCode = profile.referralCode;
  const host =
    typeof window !== "undefined" ? window.location.origin : "https://store";
  const referralLink = `${host}/register?ref=${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const handleShareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join us",
          text: `Use my referral code ${referralCode} to claim a welcome bonus.`,
          url: referralLink,
        });
      } catch {
        handleCopyReferral();
      }
    } else {
      handleCopyReferral();
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/");
  };

  const profileMenuItems = [
    {
      icon: History,
      label: "Order History",
      onClick: () => navigate("/order-history"),
    },
    {
      icon: CreditCard,
      label: "Payment Methods",
      onClick: () => navigate("/payment-methods"),
    },
    {
      icon: Star,
      label: "Rewards & Points",
      onClick: () => toast.info(`You have ${profile.points} points`),
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-28 lg:pb-8">
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center h-14 px-4 max-w-7xl mx-auto lg:px-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold ml-4">Profile</h1>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <FadeInSection delay={0.1}>
                <div className="flex items-center gap-4 p-4 lg:p-6 bg-card rounded-2xl border border-border mb-6">
                  <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold lg:text-xl">{fullName}</h2>
                    <p className="text-sm text-muted-foreground">
                      {profile.email ?? "No email"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile.phone ?? ""}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setIsEditProfileOpen(true)}
                  >
                    Edit
                  </Button>
                </div>
              </FadeInSection>

              <FadeInSection delay={0.2}>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 lg:p-6 bg-card rounded-2xl border border-border text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-primary">
                      {profile.points.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Points</p>
                  </div>
                  <div className="p-4 lg:p-6 bg-card rounded-2xl border border-border text-center">
                    <p className="text-2xl lg:text-3xl font-bold">
                      ₦{profile.walletBalance.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Wallet</p>
                  </div>
                </div>
              </FadeInSection>

              <FadeInSection delay={0.3}>
                <div className="p-4 lg:p-6 bg-card rounded-2xl border border-border mb-6">
                  <h3 className="font-bold mb-1">Refer a Friend</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Share your referral link. You both earn a reward when your
                    friend places their first paid order.
                  </p>

                  <button
                    onClick={handleCopyCode}
                    className="w-full mb-3 px-3 py-3 bg-primary/10 rounded-lg text-center hover:bg-primary/15 transition-colors"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Your code
                    </p>
                    <p className="text-lg font-bold font-mono text-primary">
                      {referralCode}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Tap to copy
                    </p>
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-secondary rounded-lg text-xs truncate text-muted-foreground">
                      {referralLink}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyReferral}
                      className="rounded-lg flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={handleShareReferral}
                      className="rounded-lg flex-shrink-0"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <button
                    onClick={() => navigate("/referrals")}
                    className="text-xs text-primary hover:underline mt-3"
                  >
                    See referral history →
                  </button>
                </div>
              </FadeInSection>
            </div>

            <FadeInSection delay={0.25} direction="right">
              <div>
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {profileMenuItems.map((item, index) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors ${
                        index !== profileMenuItems.length - 1
                          ? "border-b border-border"
                          : ""
                      }`}
                    >
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="flex-1 text-left font-medium">
                        {item.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 mt-6 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                >
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
        onSaved={() => {
          void refreshProfile();
          setIsEditProfileOpen(false);
        }}
      />
    </PageTransition>
  );
};

export default Profile;
