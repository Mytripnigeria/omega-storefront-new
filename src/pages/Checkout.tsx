import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Ticket,
  ShoppingCart,
  ChevronRight,
  CreditCard,
  Wallet,
  Star,
  Check,
  X,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useStorefront } from "@/context/StorefrontContext";
import { useMenu } from "@/context/MenuContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/PageTransition";
import { CheckoutSkeleton } from "@/components/skeletons";
import { useSkeletonLoader } from "@/hooks/useSkeletonLoader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ordersApi, type PaymentInit } from "@/services/orders";
import { couponsApi } from "@/services/coupons";
import { addressesApi, type CustomerAddress } from "@/services/addresses";
import {
  paymentMethodsApi,
  type CustomerPaymentMethod,
} from "@/services/payment-methods";

type PaymentMethod = "paystack" | "wallet" | "points" | "cash";

interface PaystackInline {
  setup(opts: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    onSuccess: (tx: { reference: string }) => void;
    onCancel?: () => void;
    onClose?: () => void;
  }): { openIframe(): void };
}

declare global {
  interface Window {
    PaystackPop?: PaystackInline;
  }
}

const PAYSTACK_SCRIPT = "https://js.paystack.co/v1/inline.js";

const PAYSTACK_LOAD_TIMEOUT_MS = 10_000;

function ensurePaystackLoaded(): Promise<PaystackInline> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PAYSTACK_SCRIPT}"]`,
    );
    const timer = setTimeout(() => {
      reject(new Error("Paystack didn't load in time. Please retry."));
    }, PAYSTACK_LOAD_TIMEOUT_MS);
    const onLoad = () => {
      clearTimeout(timer);
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject(new Error("Failed to load Paystack"));
    };
    const onError = () => {
      clearTimeout(timer);
      reject(new Error("Failed to load Paystack"));
    };
    if (existing) {
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = PAYSTACK_SCRIPT;
    script.async = true;
    script.onload = onLoad;
    script.onerror = onError;
    document.body.appendChild(script);
  });
}

const Checkout = () => {
  const navigate = useNavigate();
  const skeletonLoading = useSkeletonLoader(800);
  const {
    items,
    orderType,
    storeId,
    selectedAddressId,
    setSelectedAddressId,
    selectedPaymentMethodId,
    setSelectedPaymentMethodId,
    selectedTime,
    subtotal,
    tax,
    total,
    pointsToEarn,
    clearCart,
  } = useCart();
  const { profile, isAuthenticated } = useAuth();
  const { config } = useStorefront();
  const nairaPerPoint = Number(config?.nairaPerPoint ?? 0.1);
  const { store } = useMenu();

  const [tipPercent, setTipPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [savedCards, setSavedCards] = useState<CustomerPaymentMethod[]>([]);

  // Load saved data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    void addressesApi.list().then(setAddresses).catch(() => undefined);
    void paymentMethodsApi.list().then(setSavedCards).catch(() => undefined);
  }, [isAuthenticated]);

  // Default to first address when delivery + nothing selected
  useEffect(() => {
    if (orderType !== "delivery" || selectedAddressId) return;
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    if (def) setSelectedAddressId(def.id);
  }, [addresses, orderType, selectedAddressId, setSelectedAddressId]);

  const tipAmount = Math.round(subtotal * (tipPercent / 100));
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const pointsBalance = profile?.points ?? 0;
  // Naira value of the customer's full points balance + how many points they
  // need to redeem to cover (at most) the current total. Both come from the
  // business's loyalty settings.
  const pointsValue = Math.floor(pointsBalance * nairaPerPoint);
  const pointsRedeemed = redeemPoints
    ? Math.min(
        pointsBalance,
        nairaPerPoint > 0 ? Math.ceil(total / nairaPerPoint) : 0,
      )
    : 0;
  const pointsRedemptionValue = Math.floor(pointsRedeemed * nairaPerPoint);

  const finalTotal = useMemo(() => {
    return Math.max(
      0,
      total + tipAmount - couponDiscount - pointsRedemptionValue,
    );
  }, [total, tipAmount, couponDiscount, pointsRedemptionValue]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to use coupons");
      return;
    }
    try {
      const couponItems = items.map((i) => ({
        productId: i.menuItem.isCombo ? undefined : i.menuItem.id,
        categoryId: i.menuItem.category,
        lineTotal: i.menuItem.price * i.quantity,
      }));
      const res = await couponsApi.validate(
        couponCode.trim(),
        subtotal,
        couponItems,
      );
      if (!res.valid) {
        toast.error(res.reason ?? "Invalid coupon code");
        return;
      }
      setAppliedCoupon({
        code: res.coupon!.code,
        discount: res.discountAmount ?? 0,
      });
      setCouponCode("");
      setShowCouponInput(false);
      toast.success(
        `Coupon applied! You save ₦${(res.discountAmount ?? 0).toLocaleString()}`,
      );
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to apply coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!storeId) {
      toast.error("Pick a store first");
      return;
    }
    if (!isAuthenticated || !profile) {
      toast.error("Please sign in to place an order");
      navigate("/login");
      return;
    }
    if (orderType === "delivery" && !selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }
    if (subtotal <= 0) {
      toast.error("Add at least one item to your cart");
      return;
    }
    if (
      paymentMethod === "wallet" &&
      finalTotal > Number(profile.walletBalance ?? 0)
    ) {
      toast.error(
        `Wallet balance ₦${Number(profile.walletBalance ?? 0).toLocaleString()} can't cover ₦${finalTotal.toLocaleString()} — pick another payment method.`,
      );
      return;
    }
    if (paymentMethod === "points" && finalTotal > 0) {
      toast.error(
        "Points alone can't cover this order — pick another payment method or redeem fewer points.",
      );
      return;
    }

    // Re-validate the coupon if items have changed since it was applied — the
    // backend will reject if it no longer qualifies, so do a silent dry-run
    // first and surface the reason without losing the customer's place.
    if (appliedCoupon) {
      try {
        const couponItems = items.map((i) => ({
          productId: i.menuItem.isCombo ? undefined : i.menuItem.id,
          categoryId: i.menuItem.category,
          lineTotal: i.menuItem.price * i.quantity,
        }));
        const recheck = await couponsApi.validate(
          appliedCoupon.code,
          subtotal,
          couponItems,
        );
        if (!recheck.valid) {
          setAppliedCoupon(null);
          toast.error(
            `Coupon ${appliedCoupon.code} is no longer valid: ${recheck.reason ?? "removed"}`,
          );
          return;
        }
      } catch {
        // network blip on the recheck — don't block, server will catch it.
      }
    }

    setSubmitting(true);
    try {
      const res = await ordersApi.place({
        storeId,
        isDelivery: orderType === "delivery",
        deliveryAddressId:
          orderType === "delivery"
            ? selectedAddressId ?? undefined
            : undefined,
        scheduledFor:
          selectedTime && selectedTime !== "ASAP" ? selectedTime : undefined,
        items: items.map((i) => ({
          productId: i.menuItem.isCombo ? undefined : i.menuItem.id,
          comboId: i.menuItem.isCombo ? i.menuItem.id : undefined,
          name: i.menuItem.name,
          quantity: i.quantity,
          unitPrice: i.menuItem.price,
          variation: i.selectedOptions ?? undefined,
          notes: i.specialRequest ?? undefined,
        })),
        paymentChannel: paymentMethod,
        savedPaymentMethodId:
          paymentMethod === "paystack" && selectedPaymentMethodId
            ? selectedPaymentMethodId
            : undefined,
        couponCode: appliedCoupon?.code,
        tipAmount,
        pointsToRedeem: pointsRedeemed > 0 ? pointsRedeemed : undefined,
        notes: undefined,
      });

      const orderId = res.order.id;

      if (res.payment?.requiresAction) {
        await runPaystack(orderId, res.payment);
      } else {
        toast.success("Order placed");
        clearCart();
        navigate(`/order-tracking/${orderId}`);
      }
    } catch (e) {
      toast.error((e as Error).message ?? "Couldn't place order");
    } finally {
      setSubmitting(false);
    }
  };

  const runPaystack = async (orderId: string, init: PaymentInit) => {
    try {
      const popup = await ensurePaystackLoaded();
      if (!init.publicKey || !init.reference) {
        throw new Error("Paystack details missing");
      }
      const handler = popup.setup({
        key: init.publicKey,
        email: profile?.email ?? `customer-${profile?.id}@no-email.local`,
        amount: Math.round(finalTotal * 100),
        ref: init.reference,
        onSuccess: async ({ reference }) => {
          try {
            await ordersApi.verifyPayment(orderId, reference);
            toast.success("Payment successful");
            clearCart();
            navigate(`/order-tracking/${orderId}`);
          } catch (e) {
            // Payment verification failed but the order exists. Don't clear
            // the cart — the customer may want to retry. Send them to order
            // tracking so admin/webhook reconciliation surfaces the result.
            toast.error(
              (e as Error).message ??
                "Couldn't verify payment — your order is still recorded.",
            );
            navigate(`/order-tracking/${orderId}`);
          }
        },
        onCancel: () => {
          toast.info("Payment cancelled — you can retry from your order page.");
          navigate(`/order-tracking/${orderId}`);
        },
        onClose: () => {
          // Customer dismissed the popup — surface the same affordance.
          toast.info("Payment closed — you can retry from your order page.");
        },
      });
      handler.openIframe();
    } catch (e) {
      toast.error(
        (e as Error).message ??
          "Failed to start payment. Please try again.",
      );
    }
  };

  if (skeletonLoading) {
    return (
      <PageTransition>
        <CheckoutSkeleton />
      </PageTransition>
    );
  }

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
            <ShoppingCart className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold mb-1">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Add items to checkout
          </p>
          <Button onClick={() => navigate("/")}>Browse menu</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="max-w-3xl mx-auto flex items-center h-14 px-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Checkout</span>
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {/* Order details */}
          <section className="bg-card rounded-2xl p-4">
            <h3 className="font-semibold mb-3">
              {orderType === "delivery" ? "Delivering to" : "Picking up at"}
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                {orderType === "delivery" ? (
                  selectedAddress ? (
                    <>
                      <p className="font-medium">{selectedAddress.label}</p>
                      <p className="text-muted-foreground text-xs">
                        {selectedAddress.line1}
                        {selectedAddress.city && `, ${selectedAddress.city}`}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Choose a delivery address
                    </p>
                  )
                ) : store ? (
                  <>
                    <p className="font-medium">{store.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {store.address}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Choose a pickup location
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{selectedTime || "ASAP"}</span>
            </div>
          </section>

          {/* Items */}
          <section className="bg-card rounded-2xl p-4">
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}× {item.menuItem.name}
                  </span>
                  <span className="font-medium">
                    ₦{(item.menuItem.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Coupon */}
          <section className="bg-card rounded-2xl p-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" />
                  <span className="font-medium">{appliedCoupon.code}</span>
                  <span className="text-sm text-muted-foreground">
                    −₦{appliedCoupon.discount.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : showCouponInput ? (
              <div className="space-y-2">
                <Label>Coupon code</Label>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="ENTER CODE"
                  />
                  <Button onClick={handleApplyCoupon}>Apply</Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCouponInput(true)}
                className="flex items-center justify-between w-full text-sm"
              >
                <span className="flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  Have a promo code?
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </section>

          {/* Tip */}
          <section className="bg-card rounded-2xl p-4">
            <h3 className="font-semibold mb-3">Add tip</h3>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map((p) => (
                <button
                  key={p}
                  onClick={() => setTipPercent(p)}
                  className={cn(
                    "py-2 rounded-lg border text-sm font-medium",
                    tipPercent === p
                      ? "border-primary bg-primary/5"
                      : "border-border",
                  )}
                >
                  {p === 0 ? "None" : `${p}%`}
                </button>
              ))}
            </div>
          </section>

          {/* Payment method */}
          <section className="bg-card rounded-2xl p-4">
            <h3 className="font-semibold mb-3">Payment</h3>
            <div className="space-y-2">
              <button
                onClick={() => setPaymentMethod("paystack")}
                className={cn(
                  "flex items-center justify-between w-full p-3 rounded-lg border",
                  paymentMethod === "paystack"
                    ? "border-primary bg-primary/5"
                    : "border-border",
                )}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Card via Paystack</p>
                    <p className="text-xs text-muted-foreground">
                      Visa, Mastercard, Verve, transfer
                    </p>
                  </div>
                </div>
                {paymentMethod === "paystack" && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>

              {savedCards.length > 0 && paymentMethod === "paystack" && (
                <div className="ml-8 space-y-1">
                  {savedCards.map((c) => {
                    const isSelected = selectedPaymentMethodId === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() =>
                          setSelectedPaymentMethodId(isSelected ? null : c.id)
                        }
                        className={cn(
                          "flex items-center justify-between w-full p-2 rounded-lg text-sm border",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border",
                        )}
                      >
                        <span className="capitalize">
                          {c.brand} •••• {c.last4}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                  <p className="text-xs text-muted-foreground">
                    Skip selection to enter a new card
                  </p>
                </div>
              )}

              {profile && profile.walletBalance > 0 && (
                <button
                  onClick={() => setPaymentMethod("wallet")}
                  className={cn(
                    "flex items-center justify-between w-full p-3 rounded-lg border",
                    paymentMethod === "wallet"
                      ? "border-primary bg-primary/5"
                      : "border-border",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Wallet</p>
                      <p className="text-xs text-muted-foreground">
                        Balance: ₦{profile.walletBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {paymentMethod === "wallet" && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              )}

              <button
                onClick={() => setPaymentMethod("cash")}
                className={cn(
                  "flex items-center justify-between w-full p-3 rounded-lg border",
                  paymentMethod === "cash"
                    ? "border-primary bg-primary/5"
                    : "border-border",
                )}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">
                      Cash on {orderType === "delivery" ? "delivery" : "pickup"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pay when your order arrives
                    </p>
                  </div>
                </div>
                {paymentMethod === "cash" && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            </div>
          </section>

          {/* Loyalty points */}
          {profile && profile.points > 0 && (
            <section className="bg-card rounded-2xl p-4">
              <button
                onClick={() => setRedeemPoints(!redeemPoints)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">
                      Redeem {profile.points.toLocaleString()} points
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Worth up to ₦{pointsValue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-6 h-6 rounded-md border flex items-center justify-center",
                    redeemPoints
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {redeemPoints && <Check className="w-3 h-3" />}
                </div>
              </button>
            </section>
          )}

          {/* Summary */}
          <section className="bg-card rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (7.5%)</span>
              <span>₦{tax.toLocaleString()}</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tip</span>
                <span>₦{tipAmount.toLocaleString()}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon ({appliedCoupon?.code})</span>
                <span>−₦{couponDiscount.toLocaleString()}</span>
              </div>
            )}
            {pointsRedemptionValue > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Points</span>
                <span>−₦{pointsRedemptionValue.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span>₦{finalTotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              You'll earn {pointsToEarn.toLocaleString()} loyalty points
            </p>
          </section>
        </main>

        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40">
          <div className="max-w-3xl mx-auto">
            <Button
              className="w-full h-12 text-base"
              onClick={handlePlaceOrder}
              disabled={submitting}
            >
              {submitting
                ? "Placing order..."
                : `Place order · ₦${finalTotal.toLocaleString()}`}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Checkout;
