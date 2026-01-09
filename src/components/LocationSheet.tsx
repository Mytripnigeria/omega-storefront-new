import { X, Search, Clock, MapPin } from 'lucide-react';
import { locations } from '@/data/menuData';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LocationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSheet = ({ isOpen, onClose }: LocationSheetProps) => {
  const { orderType, setOrderType, selectedLocation, setSelectedLocation } = useCart();

  const handleSelectLocation = (locationName: string) => {
    setSelectedLocation(locationName);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-foreground/40 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-modal transition-transform duration-300 max-h-[85vh] flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold">Order details</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-4">
          {/* Order Type Toggle */}
          <div className="flex bg-secondary rounded-xl p-1 mb-4">
            <button
              onClick={() => setOrderType('pickup')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all",
                orderType === 'pickup' 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground"
              )}
            >
              Pickup
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all",
                orderType === 'delivery' 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground"
              )}
            >
              Delivery
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder={orderType === 'pickup' ? "Search locations..." : "Enter your address..."}
              className="pl-12 h-12 rounded-xl bg-secondary border-0"
            />
          </div>
        </div>

        {/* Locations List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {orderType === 'pickup' ? (
            <div className="space-y-3">
              {locations.map(location => (
                <div 
                  key={location.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-colors cursor-pointer",
                    selectedLocation === location.name 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground/30"
                  )}
                  onClick={() => handleSelectLocation(location.name)}
                >
                  <div>
                    <h3 className="font-bold">{location.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {location.open ? (
                        <span className="flex items-center gap-1 text-sm text-success">
                          <Clock className="w-3 h-3" />
                          Open now
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-destructive">
                          <Clock className="w-3 h-3" />
                          Closed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
                  </div>
                  <Button 
                    variant={selectedLocation === location.name ? "default" : "outline"}
                    size="sm"
                    disabled={!location.open}
                  >
                    {selectedLocation === location.name ? 'Selected' : 'Order'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Enter your delivery address above</p>
              <p className="text-sm text-muted-foreground mt-1">We'll show you available delivery options</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
