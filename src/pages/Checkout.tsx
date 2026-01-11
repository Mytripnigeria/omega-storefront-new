import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Ticket, ShoppingCart, ChevronRight, CreditCard, Wallet, Star, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageTransition } from '@/components/PageTransition';
import { CheckoutSkeleton } from '@/components/skeletons';
import { useSkeletonLoader } from '@/hooks/useSkeletonLoader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type PaymentMethod = 'card' | 'wallet' | 'points';

const Checkout = () => {
  const navigate = useNavigate();
  const isLoading = useSkeletonLoader(1500);
  const { 
    items, 
    orderType, 
    selectedLocation,
    subtotal, 
    tax, 
    total, 
    pointsToEarn,
    user,
    clearCart 
  } = useCart();

  const [tipPercent, setTipPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = () => {
    toast.success('Order placed successfully!', {
      description: 'You will receive a confirmation shortly.',
    });
    clearCart();
    navigate('/order-tracking');
  };

  const pointsValue = Math.floor(user.loyaltyPoints / 10); // 10 points = ₦1

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
            <ShoppingCart className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold mb-1">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm mb-4">Add items to checkout</p>
          <Button onClick={() => navigate('/')} className="rounded-full">Browse Menu</Button>
        </div>
      </PageTransition>
    );
  }

  if (isLoading) {
    return (
      <PageTransition>
        <CheckoutSkeleton />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-32 lg:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center h-14 px-4 max-w-7xl mx-auto lg:px-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold ml-4">Checkout</h1>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Order Summary Card */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {orderType === 'pickup' ? 'Pick up from' : 'Deliver to'}
                      </p>
                      <p className="text-muted-foreground text-xs">{selectedLocation}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Today, ASAP</p>
                      <p className="text-muted-foreground text-xs">15-25 min</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="border-t border-border">
                  <button className="flex items-center justify-between w-full p-4 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Ticket className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Add coupon</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="border-t border-border">
                  <button className="flex items-center justify-between w-full p-4 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{items.length} item{items.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">₦{subtotal.toLocaleString()}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Tip Section */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <h2 className="font-semibold mb-3">Add a tip</h2>
                <div className="flex gap-2">
                  {[0, 10, 15, 20].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => setTipPercent(percent)}
                      className={cn(
                        "flex-1 py-2.5 rounded-full text-sm font-medium border transition-all",
                        tipPercent === percent 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "border-border hover:bg-secondary"
                      )}
                    >
                      {percent === 0 ? 'None' : `${percent}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Your Information */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <h2 className="font-semibold mb-4">Your information</h2>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="phone" className="text-xs">Phone number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName" className="text-xs">First name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1 h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-xs">Last name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1 h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <h2 className="font-semibold mb-4">Payment method</h2>
                
                <div className="space-y-2">
                  {/* Card Option */}
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                      paymentMethod === 'card' 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:bg-secondary/50"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, Verve</p>
                    </div>
                    {paymentMethod === 'card' && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>

                  {/* Wallet Option */}
                  <button
                    onClick={() => setPaymentMethod('wallet')}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                      paymentMethod === 'wallet' 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:bg-secondary/50"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">Wallet</p>
                      <p className="text-xs text-muted-foreground">Balance: ₦{user.walletBalance.toLocaleString()}</p>
                    </div>
                    {paymentMethod === 'wallet' && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>

                  {/* Points Option */}
                  <button
                    onClick={() => setPaymentMethod('points')}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                      paymentMethod === 'points' 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:bg-secondary/50"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Star className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">Points</p>
                      <p className="text-xs text-muted-foreground">{user.loyaltyPoints.toLocaleString()} pts (₦{pointsValue.toLocaleString()})</p>
                    </div>
                    {paymentMethod === 'points' && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Card Details (show only if card selected) */}
                {paymentMethod === 'card' && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <div>
                      <Label htmlFor="cardNumber" className="text-xs">Card number</Label>
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className="mt-1 h-11 pl-11"
                        />
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 mt-0.5 w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="expiry" className="text-xs">Expiry</Label>
                        <Input
                          id="expiry"
                          name="expiry"
                          placeholder="MM/YY"
                          value={formData.expiry}
                          onChange={handleInputChange}
                          className="mt-1 h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvc" className="text-xs">CVC</Label>
                        <Input
                          id="cvc"
                          name="cvc"
                          placeholder="123"
                          value={formData.cvc}
                          onChange={handleInputChange}
                          className="mt-1 h-11"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary (Desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-20 space-y-4">
                {/* Points Earned Banner */}
                <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-xl">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    You'll earn <strong>{pointsToEarn} points</strong>
                  </span>
                </div>

                {/* Order Summary */}
                <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
                  <h2 className="font-bold mb-3">Order Summary</h2>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₦{tax.toLocaleString()}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tip</span>
                      <span>₦{tipAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span>₦{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Desktop Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  className="w-full h-12 text-base font-semibold rounded-full"
                  size="lg"
                >
                  Place order · ₦{finalTotal.toLocaleString()}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to our Terms & Policies.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Order Summary */}
          <div className="lg:hidden space-y-4 mt-5">
            {/* Points Earned Banner */}
            <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-xl">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm">
                You'll earn <strong>{pointsToEarn} points</strong>
              </span>
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>₦{tax.toLocaleString()}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tip</span>
                  <span>₦{tipAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span>₦{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom CTA */}
        <div className="fixed bottom-0 inset-x-0 p-4 bg-background border-t border-border lg:hidden safe-bottom">
          <Button
            onClick={handlePlaceOrder}
            className="w-full h-14 text-base font-semibold rounded-full"
            size="lg"
          >
            Place order · ₦{finalTotal.toLocaleString()}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            By placing this order, you agree to our Terms & Policies.
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Checkout;
