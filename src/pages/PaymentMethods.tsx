import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/PageTransition';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'verve';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  cardholderName: string;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2027',
    isDefault: true,
    cardholderName: 'Adaeze Okonkwo',
  },
  {
    id: '2',
    type: 'mastercard',
    last4: '8888',
    expiryMonth: '06',
    expiryYear: '2026',
    isDefault: false,
    cardholderName: 'Adaeze Okonkwo',
  },
  {
    id: '3',
    type: 'verve',
    last4: '1234',
    expiryMonth: '03',
    expiryYear: '2025',
    isDefault: false,
    cardholderName: 'Adaeze Okonkwo',
  },
];

const PaymentMethods = () => {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);

  const getCardIcon = (type: PaymentMethod['type']) => {
    const colors = {
      visa: 'text-blue-600',
      mastercard: 'text-orange-500',
      verve: 'text-green-600',
    };
    return <CreditCard className={`w-8 h-8 ${colors[type]}`} />;
  };

  const getCardLabel = (type: PaymentMethod['type']) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    toast.success('Default payment method updated');
  };

  const handleDelete = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault) {
      toast.error('Cannot delete default payment method');
      return;
    }
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
    toast.success('Payment method removed');
  };

  const handleAddNew = () => {
    toast.info('Add new card functionality coming soon');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 lg:pb-8">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center h-14 px-4 max-w-7xl mx-auto lg:px-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold ml-4">Payment Methods</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6 space-y-4">
          {/* Payment Methods List */}
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                {getCardIcon(method.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{getCardLabel(method.type)} •••• {method.last4}</span>
                  {method.isDefault && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Expires {method.expiryMonth}/{method.expiryYear}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSetDefault(method.id)}
                    className="w-9 h-9"
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
          ))}

          {/* Add New Card Button */}
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl border-dashed"
            onClick={handleAddNew}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Card
          </Button>

          {/* Info */}
          <p className="text-xs text-center text-muted-foreground px-4">
            Your payment information is encrypted and securely stored. We never store your full card number.
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default PaymentMethods;
