import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Package,
  Bike,
  Home,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { OrderReviewSheet } from "@/components/OrderReviewSheet";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ordersApi, type StorefrontOrder } from "@/services/orders";
import { reviewsApi } from "@/services/reviews";

const STEPS = [
  {
    id: "pending",
    label: "Order Received",
    icon: CheckCircle2,
    description: "We've got your order",
  },
  {
    id: "preparing",
    label: "Preparing",
    icon: ChefHat,
    description: "Our chefs are at it",
  },
  {
    id: "ready",
    label: "Ready",
    icon: Package,
    description: "Order is ready",
  },
  {
    id: "served",
    label: "On the way / Picked up",
    icon: Bike,
    description: "Heading your way",
  },
  {
    id: "completed",
    label: "Completed",
    icon: Home,
    description: "Enjoy your meal!",
  },
];

const OrderTracking = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { triggerHaptic } = useHaptics();

  const [order, setOrder] = useState<StorefrontOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasReview, setHasReview] = useState<boolean | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    let lastStatus: StorefrontOrder["status"] | null = null;
    let consecutiveErrors = 0;
    let interval: number | null = null;

    const tick = async () => {
      try {
        const fresh = await ordersApi.get(id);
        if (cancelled) return;
        if (lastStatus && fresh.status !== lastStatus) {
          triggerHaptic("light");
        }
        lastStatus = fresh.status;
        consecutiveErrors = 0;
        setOrder(fresh);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          consecutiveErrors += 1;
          setError((e as Error).message ?? "Couldn't load order");
          // Stop polling after 3 failed ticks; the customer can manually
          // retry via the page-focus refetch (or by reloading).
          if (consecutiveErrors >= 3 && interval != null) {
            window.clearInterval(interval);
            interval = null;
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void tick();
    interval = window.setInterval(() => {
      if (lastStatus === "completed" || lastStatus === "cancelled") {
        if (interval != null) window.clearInterval(interval);
        interval = null;
        return;
      }
      void tick();
    }, 8000);

    // Refetch when the tab regains focus — customer often tabs away after
    // placing an order.
    const onFocus = () => {
      if (cancelled) return;
      consecutiveErrors = 0;
      if (interval == null && lastStatus !== "completed" && lastStatus !== "cancelled") {
        interval = window.setInterval(() => void tick(), 8000);
      }
      void tick();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      if (interval != null) window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [id, triggerHaptic]);

  useEffect(() => {
    if (!order || hasReview !== null) return;
    if (order.status !== "completed" && order.status !== "served") return;
    void reviewsApi
      .forOrder(order.id)
      .then((r) => {
        setHasReview(!!r);
        if (!r) setTimeout(() => setIsReviewOpen(true), 1200);
      })
      .catch(() => setHasReview(false));
  }, [order, hasReview]);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!order) return;
    try {
      await reviewsApi.submit(order.id, {
        rating,
        comment: comment || undefined,
      });
      toast.success(`Thanks for your ${rating}-star review!`);
      setHasReview(true);
    } catch (e) {
      toast.error((e as Error).message ?? "Couldn't submit review");
    }
  };

  const currentStepIndex = useMemo(() => {
    if (!order) return 0;
    if (order.status === "cancelled") return -1;
    const idx = STEPS.findIndex((s) => s.id === order.status);
    return idx === -1 ? 0 : idx;
  }, [order]);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading order…</p>
        </div>
      </PageTransition>
    );
  }

  if (!id || !order) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <Package className="w-12 h-12 text-muted-foreground mb-3" />
          <h1 className="text-lg font-bold mb-1">No order to track</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {error ?? "Place an order from the menu to start tracking."}
          </p>
          <Button onClick={() => navigate("/")}>Browse menu</Button>
        </div>
      </PageTransition>
    );
  }

  const isCancelled = order.status === "cancelled";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-8">
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto flex items-center h-14 px-4 lg:px-6">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  {isCancelled ? (
                    <XCircle className="w-10 h-10 text-destructive" />
                  ) : order.status === "completed" ? (
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  ) : (
                    <span className="text-4xl">
                      {order.status === "pending" && "✅"}
                      {order.status === "preparing" && "👨‍🍳"}
                      {order.status === "ready" && "📦"}
                      {order.status === "served" &&
                        (order.isDelivery ? "🛵" : "🤝")}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-2">
                  {isCancelled
                    ? "Order Cancelled"
                    : STEPS[currentStepIndex]?.label ?? "Pending"}
                </h1>
                <p className="text-muted-foreground">
                  {isCancelled
                    ? "Your order was cancelled."
                    : STEPS[currentStepIndex]?.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Order #{order.orderNumber}
                </p>
              </div>

              {!isCancelled && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h2 className="font-bold mb-6">Order Progress</h2>
                  <div className="space-y-1">
                    {STEPS.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const Icon = step.icon;

                      return (
                        <div key={step.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                isCompleted
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-muted-foreground",
                                isCurrent && "scale-110",
                              )}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            {index !== STEPS.length - 1 && (
                              <div
                                className={cn(
                                  "w-0.5 h-12 transition-colors",
                                  isCompleted ? "bg-primary" : "bg-border",
                                )}
                              />
                            )}
                          </div>
                          <div className="pb-8 flex-1">
                            <p
                              className={cn(
                                "font-medium",
                                isCompleted
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {step.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6 mt-6 lg:mt-0">
              <div className="bg-card rounded-2xl p-4">
                <h2 className="font-bold mb-3">Summary</h2>
                <div className="space-y-2 text-sm">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span>
                        {it.quantity}× {it.name}
                      </span>
                      <span>₦{Number(it.subtotal).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₦{Number(order.subtotal).toLocaleString()}</span>
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>₦{Number(order.deliveryFee).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₦{Number(order.taxAmount).toLocaleString()}</span>
                  </div>
                  {order.tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tip</span>
                      <span>₦{Number(order.tipAmount).toLocaleString()}</span>
                    </div>
                  )}
                  {order.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({order.couponCode})</span>
                      <span>
                        −₦{Number(order.couponDiscount).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>₦{Number(order.total).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="capitalize">
                      {order.paymentChannel} · {order.paymentStatus ?? "n/a"}
                    </span>
                  </div>
                </div>
              </div>

              {order.isDelivery && order.deliveryAddress && (
                <div className="bg-card rounded-2xl p-4">
                  <h2 className="font-bold mb-2">Delivery to</h2>
                  <p className="text-sm">
                    {String(
                      (order.deliveryAddress as Record<string, unknown>)
                        .line1 ?? "",
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {String(
                      (order.deliveryAddress as Record<string, unknown>)
                        .city ?? "",
                    )}
                  </p>
                </div>
              )}

              {hasReview === false && order.status === "completed" && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setIsReviewOpen(true)}
                >
                  Leave a review
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <OrderReviewSheet
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </PageTransition>
  );
};

export default OrderTracking;
