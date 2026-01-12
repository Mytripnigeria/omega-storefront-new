import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, RotateCcw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/PageTransition';
import { OrderHistorySkeleton } from '@/components/skeletons';
import { useSkeletonLoader } from '@/hooks/useSkeletonLoader';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  selectedOptions?: string[];
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
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#QB-2847',
    date: '2024-01-08T14:30:00',
    status: 'completed',
    items: [
      { id: '1', name: 'Signature Burger', quantity: 2, price: 12.99, selectedOptions: ['Medium Rare', 'Extra Cheese', 'No Onions'] },
      { id: '2', name: 'Truffle Fries', quantity: 1, price: 7.99, selectedOptions: ['Large'] },
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
      { id: '1', name: 'Birria Ramen', quantity: 1, price: 15.99, selectedOptions: ['Extra Spicy', 'Add Egg'], specialRequest: 'No green onions please' },
      { id: '2', name: 'Mango Smoothie', quantity: 1, price: 5.99, selectedOptions: ['No Ice'] },
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
      { id: '1', name: 'Crispy Chicken Wings', quantity: 2, price: 10.99, selectedOptions: ['Buffalo Sauce', '12 pieces'] },
      { id: '2', name: 'Loaded Nachos', quantity: 1, price: 9.99, selectedOptions: ['Add Jalapeños'] },
      { id: '3', name: 'Iced Coffee', quantity: 3, price: 4.49, selectedOptions: ['Oat Milk'] },
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
      { id: '1', name: 'Fish & Chips', quantity: 1, price: 14.99, selectedOptions: ['Tartar Sauce'] },
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
      { id: '1', name: 'Chocolate Lava Cake', quantity: 2, price: 7.99, selectedOptions: ['Extra Sauce'] },
      { id: '2', name: 'Tiramisu', quantity: 1, price: 7.99 },
      { id: '3', name: 'Hot Chocolate', quantity: 2, price: 4.49, selectedOptions: ['Whipped Cream', 'Marshmallows'] },
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
    // In a real app, this would add items to cart
    navigate('/');
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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border">
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
            <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 space-y-3 lg:space-y-0">
              {mockOrders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-card rounded-lg border border-border p-4"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{order.orderNumber}</span>
                        {getStatusBadge(order.status)}
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
                  <div className="text-sm mb-3 pb-3 border-b border-border space-y-1">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id}>
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.name}
                        </span>
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <p className="text-xs text-muted-foreground/70 ml-4">
                            {item.selectedOptions.join(', ')}
                          </p>
                        )}
                        {item.specialRequest && (
                          <p className="text-xs text-muted-foreground/70 italic ml-4">"{item.specialRequest}"</p>
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-muted-foreground">+{order.items.length - 3} more items</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {order.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleReorder(order)}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reorder
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/order-tracking?order=${order.id}`)}
                    >
                      View details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default OrderHistory;
