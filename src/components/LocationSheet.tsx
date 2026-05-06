import { useEffect, useState } from 'react';
import { X, Search, Clock, MapPin, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useHaptics } from '@/hooks/useHaptics';
import {
  addressesApi,
  type CustomerAddress,
} from '@/services/addresses';
import { toast } from 'sonner';

interface LocationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSheet = ({ isOpen, onClose }: LocationSheetProps) => {
  useBodyScrollLock(isOpen);
  const { triggerHaptic } = useHaptics();
  
  // Trigger haptic on open
  useEffect(() => {
    if (isOpen) {
      triggerHaptic('medium');
    }
  }, [isOpen, triggerHaptic]);
  const {
    orderType,
    setOrderType,
    storeId,
    setStoreId,
    selectedAddressId,
    setSelectedAddressId,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { stores } = useMenu();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressLine, setAddressLine] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen || !isAuthenticated || orderType !== "delivery") return;
    void addressesApi
      .list()
      .then(setAddresses)
      .catch(() => setAddresses([]));
  }, [isOpen, isAuthenticated, orderType]);

  const filteredStores = stores.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  });

  const handleSelectStore = (id: string) => {
    triggerHaptic('success');
    setStoreId(id);
    onClose();
  };

  const handleSelectAddress = (id: string) => {
    triggerHaptic('success');
    setSelectedAddressId(id);
    onClose();
  };

  const handleQuickAddAddress = async () => {
    const trimmed = addressLine.trim();
    if (!trimmed) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to save your delivery address");
      return;
    }
    try {
      const created = await addressesApi.create({
        label: "Delivery",
        line1: trimmed,
        city: "Lagos",
        country: "Nigeria",
        isDefault: addresses.length === 0,
      });
      setAddresses((prev) => [created, ...prev]);
      setSelectedAddressId(created.id);
      setAddressLine("");
      toast.success("Address saved");
      onClose();
    } catch (e) {
      toast.error((e as Error).message ?? "Couldn't save address");
    }
  };

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  const sheetContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-xl font-bold">Order details</h2>
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
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

        {/* Search / address input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          {orderType === "pickup" ? (
            <Input
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-secondary border-0"
            />
          ) : (
            <Input
              placeholder="Enter your address..."
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleQuickAddAddress();
              }}
              className="pl-12 h-12 rounded-xl bg-secondary border-0"
            />
          )}
        </div>
      </div>

      {/* Locations List */}
      <div className="flex-1 overflow-y-auto px-6 safe-bottom-pad">
        {orderType === 'pickup' ? (
          <div className="space-y-3">
            {filteredStores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mb-2" />
                <p>No stores available</p>
              </div>
            ) : (
              filteredStores.map((store) => {
                const isSelected = storeId === store.id;
                return (
                  <div
                    key={store.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border-2 transition-colors cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30",
                    )}
                    onClick={() => handleSelectStore(store.id)}
                  >
                    <div>
                      <h3 className="font-bold">{store.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            "flex items-center gap-1 text-sm",
                            store.isActive ? "text-success" : "text-destructive",
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          {store.isActive ? "Open now" : "Closed"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {store.address}
                      </p>
                    </div>
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      disabled={!store.isActive}
                    >
                      {isSelected ? "Selected" : "Pick"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        ) : !isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Sign in to add a delivery address</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addressLine.trim() && (
              <Button
                onClick={handleQuickAddAddress}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Save "{addressLine.trim()}"
              </Button>
            )}
            {addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MapPin className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No saved addresses yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Type your address above to save it
                </p>
              </div>
            ) : (
              addresses.map((address) => {
                const isSelected = selectedAddressId === address.id;
                return (
                  <div
                    key={address.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border-2 transition-colors cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30",
                    )}
                    onClick={() => handleSelectAddress(address.id)}
                  >
                    <div>
                      <h3 className="font-bold">{address.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.line1}
                        {address.city && `, ${address.city}`}
                      </p>
                    </div>
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-foreground/50 z-50 safari-fix"
            onClick={handleClose}
          />

          {/* Mobile Sheet - slides up from bottom */}
          <motion.div 
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-50 bg-card shadow-none border border-border flex flex-col safari-fix inset-x-0 bottom-0 rounded-t-3xl max-h-[85vh] lg:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {sheetContent}
          </motion.div>

          {/* Desktop Dialog - centered with flexbox wrapper */}
          <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-card shadow-lg border border-border flex flex-col safari-fix rounded-2xl w-full max-w-lg max-h-[80vh] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {sheetContent}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
