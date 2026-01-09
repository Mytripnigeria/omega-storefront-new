import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Ticket, Percent, ShoppingCart, ChevronRight, CreditCard, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const Checkout = () => {
  const navigate = useNavigate();
  const { 
    items, 
    orderType, 
    selectedLocation,
    subtotal, 
    tax, 
    total, 
    pointsToEarn,
    clearCart 
  } = useCart();

  const [tipPercent, setTipPercent] = useState(15);
  const tipAmount = subtotal * (tipPercent / 100);
  const finalTotal = total + tipAmount;

  const [formData, setFormData] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    email: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    promoEmails: true,
    promoTexts: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = () => {
    // Simulate order placement
    toast.success('Order placed successfully!', {
      description: 'You will receive a confirmation shortly.',
    });
    clearCart();
    navigate('/order-tracking');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some items to checkout</p>
        <Button onClick={() => navigate('/')}>Browse Menu</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container flex items-center h-16 px-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Menu</span>
          </button>
        </div>
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>
      </header>

      <div className="container px-4 py-6 space-y-6">
        {/* Order Summary Card */}
        <div className="bg-card rounded-2xl p-4 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">
                {orderType === 'pickup' ? 'Pick up from' : 'Deliver to'}
              </p>
              <p className="text-muted-foreground text-sm">{selectedLocation}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">Today by 10:30 PM</p>
              <p className="text-muted-foreground text-sm">Estimated time</p>
            </div>
          </div>

          <button className="flex items-center justify-between w-full py-3 border-t border-border">
            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Add coupon or gift card</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button className="flex items-center justify-between w-full py-3 border-t border-border">
            <div className="flex items-center gap-3">
              <Percent className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Tip</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{tipPercent}%</span>
              <span className="font-semibold">${tipAmount.toFixed(2)}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>

          <button className="flex items-center justify-between w-full py-3 border-t border-border">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">{items.length} item{items.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        </div>

        {/* Your Information */}
        <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-lg font-bold">Your information</h2>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="phone">Mobile number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(555) 555-5555"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1.5"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="promoEmails" 
                  checked={formData.promoEmails}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, promoEmails: !!checked }))}
                />
                <label htmlFor="promoEmails" className="text-sm">
                  Get promotional emails from QuickBite
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="promoTexts" 
                  checked={formData.promoTexts}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, promoTexts: !!checked }))}
                />
                <label htmlFor="promoTexts" className="text-sm">
                  Get promotional texts from QuickBite
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-lg font-bold">Payment</h2>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="cardNumber">Card number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className="mt-1.5 pl-12"
                />
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 mt-0.75 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="expiry">Expiry date</Label>
                <Input
                  id="expiry"
                  name="expiry"
                  placeholder="MM / YY"
                  value={formData.expiry}
                  onChange={handleInputChange}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="cvc">Security code</Label>
                <Input
                  id="cvc"
                  name="cvc"
                  placeholder="CVC"
                  value={formData.cvc}
                  onChange={handleInputChange}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Points Banner */}
        <div className="flex items-center gap-2 px-4 py-3 gradient-points rounded-xl text-accent-foreground">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-semibold">
            You'll earn <strong>{pointsToEarn} points</strong> with this order
          </span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-card border-t border-border">
        <Button
          onClick={handlePlaceOrder}
          className="w-full h-14 text-lg font-bold"
          size="lg"
        >
          Place order
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          By placing this order, you agree to our Terms & Policies.
        </p>
      </div>
    </div>
  );
};

export default Checkout;
