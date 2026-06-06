import { useEffect, useState } from "react";
import {
  X,
  Star,
  Wallet,
  ChevronRight,
  Gift,
  TrendingUp,
  ArrowLeft,
  Plus,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useAuth } from "@/context/AuthContext";
import { useStorefront } from "@/context/StorefrontContext";
import {
  profileApi,
  type WalletTx,
  type PointsTx,
  type CustomerProfile,
} from "@/services/auth";
import { referralsApi, type MyReferralsSummary } from "@/services/referrals";
import {
  storefrontApi,
  type PublicPaymentMethod,
} from "@/services/storefront";

interface WalletSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = "main" | "history" | "redeem" | "deposit";

const tierNextPoints: Record<CustomerProfile["loyaltyTier"], number> = {
  bronze: 500,
  silver: 1500,
  gold: 3000,
  platinum: Infinity,
};

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const WalletSheet = ({ isOpen, onClose }: WalletSheetProps) => {
  useBodyScrollLock(isOpen);
  const { profile, isAuthenticated } = useAuth();
  const { config } = useStorefront();
  const nairaPerPoint = Number(config?.nairaPerPoint ?? 0.1);

  const [view, setView] = useState<View>("main");
  const [walletTx, setWalletTx] = useState<WalletTx[]>([]);
  const [pointsTx, setPointsTx] = useState<PointsTx[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [referralSummary, setReferralSummary] =
    useState<MyReferralsSummary | null>(null);
  const [depositBank, setDepositBank] = useState<
    PublicPaymentMethod["bank"] | null
  >(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    storefrontApi
      .getPaymentMethods()
      .then((methods) => {
        if (cancelled) return;
        const transfer = methods.find(
          (m) => m.type === "transfer" && m.bank?.accountNumber,
        );
        setDepositBank(transfer?.bank ?? null);
      })
      .catch(() => {
        // No transfer method configured — deposit view shows a fallback message.
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    let cancelled = false;
    referralsApi
      .mySummary()
      .then((r) => {
        if (!cancelled) setReferralSummary(r);
      })
      .catch(() => {
        // non-critical — pending rewards just won't show
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (!isOpen || view !== "history" || !isAuthenticated) return;
    let cancelled = false;
    setHistoryLoading(true);
    Promise.all([profileApi.myWallet(), profileApi.myPoints()])
      .then(([wallet, points]) => {
        if (cancelled) return;
        setWalletTx(wallet);
        setPointsTx(points);
      })
      .catch((e: Error) => {
        if (!cancelled) toast.error(e.message ?? "Couldn't load history");
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, view, isAuthenticated]);

  const handleClose = () => {
    setView("main");
    onClose();
  };

  if (!profile) {
    return (
      <>
        <div
          className={cn(
            "fixed inset-0 bg-foreground/50 z-50 transition-opacity duration-300 safari-fix",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={handleClose}
        />
        <div
          className={cn(
            "fixed z-50 bg-card shadow-none border border-border transition-all duration-300 flex flex-col safari-fix",
            "inset-x-0 bottom-0 rounded-t-3xl max-h-[40vh]",
            isOpen ? "translate-y-0" : "translate-y-full",
            "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:rounded-2xl lg:w-full lg:max-w-md lg:max-h-[40vh]",
            isOpen
              ? "lg:-translate-y-1/2 lg:opacity-100"
              : "lg:-translate-y-1/2 lg:opacity-0 lg:pointer-events-none",
          )}
        >
          <div className="flex flex-col items-center justify-center text-center p-8 gap-3 flex-1">
            <Wallet className="w-10 h-10 text-muted-foreground" />
            <h3 className="text-lg font-bold">Sign in to view wallet</h3>
            <Button onClick={handleClose} className="rounded-full">
              Close
            </Button>
          </div>
        </div>
      </>
    );
  }

  const tier = profile.loyaltyTier;
  const points = profile.points;
  const wallet = profile.walletBalance;

  const nextTier =
    tier === "platinum"
      ? null
      : tier === "bronze"
        ? "Silver"
        : tier === "silver"
          ? "Gold"
          : "Platinum";
  const cap = tierNextPoints[tier];
  const pointsToNext = cap === Infinity ? 0 : cap - points;
  const progress = cap === Infinity ? 100 : Math.min(100, (points / cap) * 100);

  const renderMainView = () => (
    <>
      <div className="bg-primary rounded-2xl p-5 text-primary-foreground mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 opacity-80">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Wallet Balance</span>
            </div>
            <p className="text-3xl font-bold mb-1">
              ₦{Number(wallet).toLocaleString()}
            </p>
            <p className="text-xs opacity-70">
              Use at checkout to pay for your order.
            </p>
          </div>
          <button
            onClick={() => setView("deposit")}
            aria-label="Add money to wallet"
            className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {referralSummary &&
          referralSummary.rewardType === "wallet_credit" &&
          referralSummary.totalRewardPending > 0 && (
            <div className="mt-3 pt-3 border-t border-primary-foreground/20 flex items-center justify-between text-xs opacity-90">
              <span>Pending from referrals</span>
              <span className="font-semibold">
                ₦{referralSummary.totalRewardPending.toLocaleString()}
              </span>
            </div>
          )}
      </div>

      <div className="bg-primary rounded-2xl p-5 text-primary-foreground mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 opacity-80">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">{tier}</span>
          </div>
          <span className="text-xs opacity-60">Loyalty Points</span>
        </div>
        <p className="text-3xl font-bold mb-1">
          {Number(points).toLocaleString()}
        </p>
        <p className="text-xs opacity-70 mb-3">
          Worth ₦{Math.floor(points * nairaPerPoint).toLocaleString()}
        </p>
        {nextTier && (
          <div>
            <div className="flex items-center justify-between text-xs mb-2 opacity-80">
              <span>
                {pointsToNext.toLocaleString()} pts to {nextTier}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-foreground rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setView("redeem")}
          className="flex flex-col items-center gap-2 p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
        >
          <Gift className="w-5 h-5" />
          <span className="font-medium text-sm">Redeem Points</span>
        </button>
        <button
          onClick={() => setView("history")}
          className="flex flex-col items-center gap-2 p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
        >
          <TrendingUp className="w-5 h-5" />
          <span className="font-medium text-sm">View History</span>
        </button>
      </div>

      <div className="bg-secondary rounded-xl p-4 mb-4">
        <h3 className="font-semibold text-sm mb-3">How to Earn Points</h3>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              Earn points on every paid order — your tier determines the rate.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              Apply points at checkout to discount your order.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              Refer a friend — earn a bonus when they place their first paid order.
            </span>
          </div>
        </div>
      </div>

      {referralSummary &&
        referralSummary.rewardType === "points" &&
        referralSummary.totalRewardPending > 0 && (
          <div className="bg-secondary rounded-xl p-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Pending points from referrals
            </span>
            <span className="font-semibold">
              {referralSummary.totalRewardPending.toLocaleString()} pts
            </span>
          </div>
        )}
    </>
  );

  const renderHistoryView = () => {
    const merged: Array<{
      id: string;
      label: string;
      sub: string;
      createdAt: string;
      sign: "+" | "-";
      amount: string;
      tone: "credit" | "debit" | "neutral";
    }> = [
      ...walletTx.map((t) => ({
        id: `w-${t.id}`,
        label: t.description,
        sub: formatDate(t.createdAt),
        createdAt: t.createdAt,
        sign: (t.type === "credit" ? "+" : "-") as "+" | "-",
        amount: `₦${Number(t.amount).toLocaleString()}`,
        tone: (t.type === "credit" ? "credit" : "debit") as "credit" | "debit",
      })),
      ...pointsTx.map((t) => ({
        id: `p-${t.id}`,
        label: t.description,
        sub: formatDate(t.createdAt),
        createdAt: t.createdAt,
        sign: (t.type === "earned" ? "+" : "-") as "+" | "-",
        amount: `${Number(t.points).toLocaleString()} pts`,
        tone: "neutral" as const,
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return (
      <>
        <button
          onClick={() => setView("main")}
          className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h3 className="text-lg font-bold mb-4">Transaction History</h3>

        {historyLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Loading…
          </p>
        ) : merged.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity yet.
          </p>
        ) : (
          <div className="space-y-2">
            {merged.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-xl"
              >
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <span
                  className={cn(
                    "font-bold text-sm",
                    item.tone === "debit"
                      ? "text-destructive"
                      : item.tone === "credit"
                        ? "text-success"
                        : "text-foreground",
                  )}
                >
                  {item.sign}
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderRedeemView = () => (
    <>
      <button
        onClick={() => setView("main")}
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
          You have <strong>{Number(points).toLocaleString()} points</strong>{" "}
          (worth ₦{Math.floor(points * nairaPerPoint).toLocaleString()})
        </p>
        <p className="text-sm text-muted-foreground">
          Add items to your cart and apply your points at checkout —{" "}
          {nairaPerPoint > 0
            ? `1 point = ₦${nairaPerPoint.toLocaleString()}`
            : "points are not redeemable right now"}
          .
        </p>
        <Button onClick={handleClose} className="mt-6 rounded-full">
          Start Ordering
        </Button>
      </div>
    </>
  );

  const renderDepositView = () => {
    const copy = (value?: string) => {
      if (!value) return;
      void navigator.clipboard
        ?.writeText(value)
        .then(() => toast.success("Copied"))
        .catch(() => undefined);
    };
    const rows: Array<{ label: string; value?: string }> = [
      { label: "Bank", value: depositBank?.bankName },
      { label: "Account number", value: depositBank?.accountNumber },
      { label: "Account name", value: depositBank?.accountName },
    ];
    return (
      <>
        <button
          onClick={() => setView("main")}
          className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h3 className="text-lg font-bold mb-2">Add money to wallet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Transfer to the account below. Your wallet is credited once the
          transfer is confirmed.
        </p>

        {depositBank?.accountNumber ? (
          <div className="bg-secondary rounded-xl p-4 space-y-3">
            {rows.map((r) =>
              r.value ? (
                <div
                  key={r.label}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                    <p className="font-medium text-sm truncate">{r.value}</p>
                  </div>
                  {r.label === "Account number" && (
                    <button
                      onClick={() => copy(r.value)}
                      className="flex items-center gap-1 text-xs text-primary flex-shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  )}
                </div>
              ) : null,
            )}
          </div>
        ) : (
          <div className="bg-secondary rounded-xl p-4 text-sm text-muted-foreground text-center">
            Bank deposit details aren't available yet. Please contact the store
            to top up your wallet.
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-foreground/50 z-50 transition-opacity duration-300 safari-fix",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={handleClose}
      />

      <div
        className={cn(
          "fixed z-50 bg-card shadow-none border border-border transition-all duration-300 flex flex-col safari-fix",
          "inset-x-0 bottom-0 rounded-t-3xl h-[85vh] max-h-[85vh]",
          isOpen ? "translate-y-0" : "translate-y-full",
          "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:rounded-2xl lg:w-full lg:max-w-md lg:h-auto lg:max-h-[80vh]",
          isOpen
            ? "lg:-translate-y-1/2 lg:opacity-100"
            : "lg:-translate-y-1/2 lg:opacity-0 lg:pointer-events-none",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-bold">Wallet & Rewards</h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 safe-bottom-pad">
          {view === "main" && renderMainView()}
          {view === "history" && renderHistoryView()}
          {view === "redeem" && renderRedeemView()}
          {view === "deposit" && renderDepositView()}
        </div>
      </div>
    </>
  );
};
