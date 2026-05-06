import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  FadeInSection,
} from "@/components/PageTransition";
import { OrderHistorySkeleton } from "@/components/skeletons";
import { useHaptics } from "@/hooks/useHaptics";
import { ordersApi, type StorefrontOrder } from "@/services/orders";

const OrderHistory = () => {
  const navigate = useNavigate();
  const { triggerHaptic } = useHaptics();
  const [orders, setOrders] = useState<StorefrontOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void ordersApi
      .list({ limit: 50 })
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data);
        setError(null);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message ?? "Couldn't load orders");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const statusBadge = (status: StorefrontOrder["status"]) => {
    const styles: Record<StorefrontOrder["status"], string> = {
      pending: "bg-yellow-500/10 text-yellow-600",
      preparing: "bg-blue-500/10 text-blue-600",
      ready: "bg-indigo-500/10 text-indigo-600",
      served: "bg-success/10 text-success",
      completed: "bg-success/10 text-success",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  const handleReorder = (_o: StorefrontOrder) => {
    triggerHaptic("light");
    navigate("/");
  };

  if (isLoading) {
    return (
      <PageTransition>
        <OrderHistorySkeleton />
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
            <h1 className="text-lg font-bold ml-4">Order History</h1>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-4">
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          {orders.length === 0 ? (
            <FadeInSection>
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button onClick={() => navigate("/")}>Browse menu</Button>
              </div>
            </FadeInSection>
          ) : (
            <StaggerContainer className="space-y-3">
              {orders.map((o) => (
                <StaggerItem key={o.id}>
                  <button
                    onClick={() => navigate(`/order-tracking/${o.id}`)}
                    className="w-full bg-card rounded-2xl p-4 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">#{o.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(o.createdAt)} · {formatTime(o.createdAt)}
                        </p>
                      </div>
                      {statusBadge(o.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                      {o.items.map((it) => `${it.quantity}× ${it.name}`).join(", ")}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{o.isDelivery ? "Delivery" : "Pickup"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          ₦{Number(o.total).toLocaleString()}
                        </span>
                        {o.status === "completed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReorder(o);
                            }}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <RotateCcw className="w-3 h-3" /> Reorder
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default OrderHistory;
