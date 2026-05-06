import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Gift,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/context/AuthContext";
import {
  referralsApi,
  type MyReferralsSummary,
  type ReferralStatus,
} from "@/services/referrals";

const statusLabel: Record<ReferralStatus, string> = {
  pending: "Pending",
  signed_up: "Signed up",
  first_purchase: "First order placed",
  rewarded: "Rewarded",
  expired: "Expired",
};

const statusStyle: Record<ReferralStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  signed_up: "bg-blue-100 text-blue-700",
  first_purchase: "bg-indigo-100 text-indigo-700",
  rewarded: "bg-green-100 text-green-700",
  expired: "bg-gray-100 text-gray-700",
};

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatReward = (amount: number, type: MyReferralsSummary["rewardType"]) =>
  type === "wallet_credit"
    ? `₦${amount.toLocaleString()}`
    : `${amount.toLocaleString()} pts`;

export default function Referrals() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<MyReferralsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    referralsApi
      .mySummary()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e: Error) => {
        if (!cancelled)
          toast.error(e.message ?? "Couldn't load referral history");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const referralCode = data?.referralCode ?? "";
  const host =
    typeof window !== "undefined" ? window.location.origin : "https://store";
  const referralLink = referralCode
    ? `${host}/register?ref=${referralCode}`
    : "";

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied");
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied");
  };

  const handleShare = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me",
          text: `Use my referral code ${referralCode} for a welcome bonus.`,
          url: referralLink,
        });
        return;
      } catch {
        // fall through to copy
      }
    }
    handleCopyLink();
  };

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <Gift className="w-12 h-12 text-muted-foreground mb-3" />
          <h1 className="text-lg font-bold mb-1">Sign in to view referrals</h1>
          <Button onClick={() => navigate("/login")} className="mt-2">
            Sign in
          </Button>
        </div>
      </PageTransition>
    );
  }

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
            <h1 className="text-lg font-bold ml-4">Refer a Friend</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6 space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Loading…
            </p>
          ) : !data ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              We couldn't load your referrals.
            </p>
          ) : (
            <>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
                <Sparkles className="w-7 h-7 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Your code</p>
                <p className="text-2xl font-bold font-mono mt-1 text-primary">
                  {referralCode}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy code
                  </Button>
                  <Button size="sm" onClick={handleShare} className="gap-2">
                    <Share2 className="w-4 h-4" /> Share link
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Friends who sign up with your code get a welcome bonus —
                  you'll earn yours once they place their first paid order.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-card border border-border p-3 text-center">
                  <Users className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-2xl font-bold">{data.totalReferred}</p>
                  <p className="text-xs text-muted-foreground">Referred</p>
                </div>
                <div className="rounded-xl bg-card border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-success">
                    {formatReward(data.totalRewardEarned, data.rewardType)}
                  </p>
                  <p className="text-xs text-muted-foreground">Earned</p>
                </div>
                <div className="rounded-xl bg-card border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatReward(data.totalRewardPending, data.rewardType)}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="font-medium text-sm">Referral history</p>
                </div>
                {data.referrals.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No referrals yet — share your code to get started.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {data.referrals.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {r.referredName ??
                              r.referredEmail ??
                              r.referredPhone ??
                              "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(r.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${statusStyle[r.status]}`}
                          >
                            {statusLabel[r.status]}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatReward(
                              Number(r.referrerReward),
                              r.rewardType,
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
