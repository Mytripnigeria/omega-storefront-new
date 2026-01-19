import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, RotateCcw, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition, StaggerContainer, StaggerItem, FadeInSection } from '@/components/PageTransition';
import { OrderHistorySkeleton } from '@/components/skeletons';
import { OrderReviewSheet } from '@/components/OrderReviewSheet';
import { useSkeletonLoader } from '@/hooks/useSkeletonLoader';
import { useHaptics } from '@/hooks/useHaptics';
import { toast } from 'sonner';

interface OrderItemOption {
  name: string;
  price?: number;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  selectedOptions?: OrderItemOption[];
  specialRequest?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'completed' | 'cancelled' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  location: string;
  orderType: 'pickup' | 'delivery';
  rating?: number;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#QB-2847',
    date: '2024-01-08T14:30:00',
    status: 'completed',
    items: [
      { id: '1', name: 'Signature Burger', quantity: 2, price: 12.99, selectedOptions: [{ name: 'Medium Rare' }, { name: 'Extra Cheese', price: 2.00 }, { name: 'No Onions' }] },
      { id: '2', name: 'Truffle Fries', quantity: 1, price: 7.99, selectedOptions: [{ name: 'Large', price: 1.50 }] },
      { id: '3', name: 'Fresh Lemonade', quantity: 2, price: 4.99 },
    ],
    subtotal: 43.95,
    deliveryFee: 3.99,
    total: 47.94,
    location: 'Miramar',
    orderType: 'delivery',
  },
  {
    id: '2',
    orderNumber: '#QB-2831',
    date: '2024-01-05T12:15:00',
    status: 'completed',
    items: [
      { id: '1', name: 'Birria Ramen', quantity: 1, price: 15.99, selectedOptions: [{ name: 'Extra Spicy' }, { name: 'Add Egg', price: 1.50 }], specialRequest: 'No green onions please' },
      { id: '2', name: 'Mango Smoothie', quantity: 1, price: 5.99, selectedOptions: [{ name: 'No Ice' }] },
    ],
    subtotal: 21.98,
    deliveryFee: 0,
    total: 21.98,
    location: 'Brickell',
    orderType: 'pickup',
  },
  {
    id: '3',
    orderNumber: '#QB-2798',
    date: '2024-01-02T19:45:00',
    status: 'completed',
    items: [
      { id: '1', name: 'Crispy Chicken Wings', quantity: 2, price: 10.99, selectedOptions: [{ name: 'Buffalo Sauce' }, { name: '12 pieces', price: 3.00 }] },
      { id: '2', name: 'Loaded Nachos', quantity: 1, price: 9.99, selectedOptions: [{ name: 'Add Jalapeños', price: 0.50 }] },
      { id: '3', name: 'Iced Coffee', quantity: 3, price: 4.49, selectedOptions: [{ name: 'Oat Milk', price: 0.75 }] },
    ],
    subtotal: 45.44,
    deliveryFee: 3.99,
    total: 49.43,
    location: 'Wynwood',
    orderType: 'delivery',
  },
  {
    id: '4',
    orderNumber: '#QB-2756',
    date: '2023-12-28T11:30:00',
    status: 'cancelled',
    items: [
      { id: '1', name: 'Fish & Chips', quantity: 1, price: 14.99, selectedOptions: [{ name: 'Tartar Sauce' }] },
    ],
    subtotal: 14.99,
    deliveryFee: 0,
    total: 14.99,
    location: 'Wellington',
    orderType: 'pickup',
  },
  {
    id: '5',
    orderNumber: '#QB-2712',
    date: '2023-12-20T18:00:00',
    status: 'completed',
    items: [
      { id: '1', name: 'Chocolate Lava Cake', quantity: 2, price: 7.99, selectedOptions: [{ name: 'Extra Sauce', price: 1.00 }] },
      { id: '2', name: 'Tiramisu', quantity: 1, price: 7.99 },
      { id: '3', name: 'Hot Chocolate', quantity: 2, price: 4.49, selectedOptions: [{ name: 'Whipped Cream', price: 0.50 }, { name: 'Marshmallows', price: 0.50 }] },
    ],
    subtotal: 32.95,
    deliveryFee: 3.99,
    total: 36.94,
    location: 'Coral Springs',
    orderType: 'delivery',
  },
];

const OrderHistory = () => {
  const navigate = useNavigate();
  const isLoading = useSkeletonLoader(1500);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [orders, setOrders] = useState(mockOrders);
  const { triggerHaptic } = useHaptics();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      completed: 'bg-success/10 text-success',
      cancelled: 'bg-destructive/10 text-destructive',
      refunded: 'bg-muted text-muted-foreground',
    };
    const labels = {
      completed: 'Completed',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleReorder = (order: Order) => {
    triggerHaptic('medium');
    navigate('/');
  };

  const handleOpenReview = (order: Order) => {
    triggerHaptic('selection');
    setSelectedOrderForReview(order);
    setIsReviewOpen(true);
  };

  const handleReviewSubmit = (rating: number, review: string) => {
    if (selectedOrderForReview) {
      setOrders(prev => prev.map(o => 
        o.id === selectedOrderForReview.id ? { ...o, rating } : o
      ));
      toast.success(`Thanks for your ${rating}-star review!`);
    }
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
      <div className="min-h-screen bg-background pb-8">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto flex items-center h-14 px-4 lg:px-6 gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg">Order History</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          {mockOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="font-semibold text-lg mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-4">Your order history will appear here</p>
              <Button onClick={() => navigate('/')}>
                Start ordering
              </Button>
            </div>
          ) : (
            <StaggerContainer className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 space-y-3 lg:space-y-0">
              {orders.map((order) => (
                <StaggerItem key={order.id}>
                  <div 
                    className="bg-card rounded-lg border border-border p-4"
                  >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{order.orderNumber}</span>
                        {getStatusBadge(order.status)}
                        {order.rating && (
                          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-medium">
                            <Star className="w-3 h-3 fill-current" />
                            {order.rating}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(order.date)} at {formatTime(order.date)}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold">${order.total.toFixed(2)}</span>
                  </div>

                  {/* Order Details */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{order.location}</span>
                    <span className="text-border">•</span>
                    <span className="capitalize">{order.orderType}</span>
                  </div>

                  {/* Items Summary */}
                  <div className="text-sm mb-3 pb-3 border-b border-border space-y-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id}>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground font-medium">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
                        </div>
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="ml-4 mt-0.5 space-y-0.5">
                            {item.selectedOptions.map((option, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                                  {option.name}
                                </span>
                                {option.price && option.price > 0 && (
                                  <span>+${option.price.toFixed(2)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {item.specialRequest && (
                          <p className="text-xs text-muted-foreground/70 italic ml-4 mt-0.5">"{item.specialRequest}"</p>
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-muted-foreground">+{order.items.length - 3} more items</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'completed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[100px]"
                          onClick={() => handleReorder(order)}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reorder
                        </Button>
                        {!order.rating && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[100px]"
                            onClick={() => handleOpenReview(order)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 min-w-[110px]"
                      onClick={() => navigate(`/order-tracking?order=${order.id}`)}
                    >
                      View details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </main>
      </div>

      {/* Review Sheet */}
      <OrderReviewSheet
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSubmit={handleReviewSubmit}
        orderId={selectedOrderForReview?.orderNumber}
      />
    </PageTransition>
  );
};

export default OrderHistory;
