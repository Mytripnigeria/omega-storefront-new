import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  paymentMethodsApi,
  type CustomerPaymentMethod,
  type PaymentMethodBrand,
} from "@/services/payment-methods";

const PaymentMethods = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [methods, setMethods] = useState<CustomerPaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    void paymentMethodsApi
      .list()
      .then((data) => {
        if (!cancelled) setMethods(data);
      })
      .catch((e: Error) => {
        if (!cancelled) toast.error(e.message ?? "Couldn't load cards");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const cardColor = (brand: PaymentMethodBrand) => {
    const colors: Record<PaymentMethodBrand, string> = {
      visa: "text-blue-600",
      mastercard: "text-orange-500",
      verve: "text-green-600",
      amex: "text-indigo-500",
      discover: "text-amber-500",
      other: "text-muted-foreground",
    };
    return <CreditCard className={`w-8 h-8 ${colors[brand]}`} />;
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updated = await paymentMethodsApi.update(id, { isDefault: true });
      setMethods((prev) =>
        prev.map((m) => ({ ...m, isDefault: m.id === updated.id })),
      );
      toast.success("Default payment method updated");
    } catch (e) {
      toast.error((e as Error).message ?? "Couldn't update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this card?")) return;
    try {
      await paymentMethodsApi.remove(id);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      toast.success("Card removed");
    } catch (e) {
      toast.error((e as Error).message ?? "Couldn't remove");
    }
  };

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground mb-3" />
          <h1 className="text-lg font-bold mb-1">Sign in to manage cards</h1>
          <Button onClick={() => navigate("/login")} className="mt-2">
            Sign in
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 lg:pb-8">
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center h-14 px-4 max-w-7xl mx-auto lg:px-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold ml-4">Payment Methods</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6 space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Loading…
            </p>
          ) : methods.length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed p-6 text-center">
              <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h2 className="font-semibold mb-1">No saved cards yet</h2>
              <p className="text-sm text-muted-foreground">
                Cards are saved automatically when you pay with Paystack.
              </p>
            </div>
          ) : (
            methods.map((method) => (
              <div
                key={method.id}
                className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  {cardColor(method.brand)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold capitalize">
                      {method.brand} •••• {method.last4}
                    </span>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {method.bank ? `${method.bank} · ` : ""}
                    Expires {method.expMonth}/{method.expYear}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetDefault(method.id)}
                      className="w-9 h-9"
                      title="Set as default"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(method.id)}
                    className="w-9 h-9 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}

          <p className="text-xs text-center text-muted-foreground px-4">
            Your card details are tokenised by Paystack — we only ever store the
            last 4 digits.
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default PaymentMethods;
