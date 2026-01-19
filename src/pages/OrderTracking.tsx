import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Phone, CheckCircle2, Circle, ChefHat, Package, Bike, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/PageTransition';
import { OrderReviewSheet } from '@/components/OrderReviewSheet';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type OrderStep = 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered';

const steps = [
  { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2, description: 'Your order has been received' },
  { id: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Our chefs are making your food' },
  { id: 'ready', label: 'Ready', icon: Package, description: 'Your order is ready' },
  { id: 'out-for-delivery', label: 'On the way', icon: Bike, description: 'Your order is out for delivery' },
  { id: 'delivered', label: 'Delivered', icon: Home, description: 'Enjoy your meal!' },
];

const OrderTracking = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OrderStep>('confirmed');
  const [estimatedTime, setEstimatedTime] = useState(25);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { triggerHaptic } = useHaptics();

  // Simulate order progress
  useEffect(() => {
    const stepOrder: OrderStep[] = ['confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < stepOrder.length) {
        setCurrentStep(stepOrder[currentIndex]);
        setEstimatedTime(prev => Math.max(0, prev - 8));
        triggerHaptic('light');
        
        // Show review sheet when delivered
        if (stepOrder[currentIndex] === 'delivered') {
          triggerHaptic('success');
          // Small delay before showing review modal
          setTimeout(() => {
            setIsReviewOpen(true);
          }, 1000);
        }
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [triggerHaptic]);

  const handleReviewSubmit = (rating: number, review: string) => {
    toast.success(`Thanks for your ${rating}-star review!`);
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-8">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto flex items-center h-14 px-4 lg:px-6">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Left Column - Status & Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  {currentStep === 'delivered' ? (
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  ) : (
                    <span className="text-4xl">
                      {currentStep === 'confirmed' && '✅'}
                      {currentStep === 'preparing' && '👨‍🍳'}
                      {currentStep === 'ready' && '📦'}
                      {currentStep === 'out-for-delivery' && '🛵'}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-2">
                  {steps.find(s => s.id === currentStep)?.label}
                </h1>
                <p className="text-muted-foreground">
                  {steps.find(s => s.id === currentStep)?.description}
                </p>
                {currentStep !== 'delivered' && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{estimatedTime} min remaining</span>
                  </div>
                )}
              </div>

              {/* Progress Steps */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="font-bold mb-6">Order Progress</h2>
                <div className="space-y-1">
                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            isCompleted ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          )}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          {index < steps.length - 1 && (
                            <div className={cn(
                              "w-0.5 h-12 transition-all",
                              index < currentStepIndex ? "bg-primary" : "bg-border"
                            )} />
                          )}
                        </div>
                        <div className="pt-2 pb-6">
                          <h3 className={cn(
                            "font-semibold",
                            isCurrent && "text-primary"
                          )}>{step.label}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Order Details */}
            <div className="mt-6 lg:mt-0">
              <div className="lg:sticky lg:top-20 space-y-4">
                {/* Order Details */}
                <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
                  <h2 className="font-bold">Order Details</h2>
                  
                  <div className="flex items-center gap-3 py-3 border-b border-border">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Pickup Location</p>
                      <p className="text-sm text-muted-foreground">Downtown - 123 Main Street</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-3 border-b border-border">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Contact Restaurant</p>
                      <p className="text-sm text-muted-foreground">(555) 123-4567</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h3 className="font-medium mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">1x Signature Burger</span>
                        <span>$12.99</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">1x Truffle Fries</span>
                        <span>$7.99</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border font-semibold">
                        <span>Total</span>
                        <span>$22.62</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    Need Help?
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Cancel Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Sheet */}
      <OrderReviewSheet
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSubmit={handleReviewSubmit}
        orderId="ORD-2024-001"
      />
    </PageTransition>
  );
};

export default OrderTracking;
