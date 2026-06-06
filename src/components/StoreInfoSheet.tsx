import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMenu } from '@/context/MenuContext';
import { getStoreStatus } from '@/lib/format';
import { cn } from '@/lib/utils';

interface StoreInfoSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAY_KEYS: Array<{ key: string; label: string }> = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const StoreInfoContent = () => {
  const { store } = useMenu();
  const todayKey = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();
  const status = getStoreStatus(store?.openingHours ?? null);

  return (
    <div className="space-y-6">
      {/* Live status */}
      {status && (
        <div
          className={cn(
            'flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2',
            status.isOpen
              ? 'bg-success/10 text-success'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Clock className="w-4 h-4" />
          <span>{status.label}</span>
        </div>
      )}

      {/* Operating Hours */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Operating Hours</h3>
        </div>
        <div className="space-y-2 pl-7">
          {DAY_KEYS.map(({ key, label }) => {
            const hours = store?.openingHours?.[key];
            const display = !hours
              ? 'Hours not set'
              : hours.closed
                ? 'Closed'
                : `${hours.open} – ${hours.close}`;
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={`flex justify-between text-sm py-1.5 px-3 rounded-lg ${
                  isToday ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                <span className={isToday ? 'text-primary' : 'text-muted-foreground'}>
                  {label}
                  {isToday && <span className="ml-2 text-xs">(Today)</span>}
                </span>
                <span>{display}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location */}
      {store && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Location</h3>
          </div>
          <div className="pl-7 space-y-1">
            <p className="text-sm">{store.address}</p>
            {(store.city || store.state) && (
              <p className="text-sm text-muted-foreground">
                {[store.city, store.state].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Contact */}
      {store && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Contact</h3>
          </div>
          <div className="pl-7 space-y-2">
            {store.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{store.phone}</span>
              </div>
            )}
            {store.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{store.email}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Holiday hours may vary. Please call ahead to confirm.
        </p>
      </div>
    </div>
  );
};

export const StoreInfoSheet = ({ isOpen, onClose }: StoreInfoSheetProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left pb-4">
            <SheetTitle className="text-xl">Store Information</SheetTitle>
          </SheetHeader>
          <StoreInfoContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Store Information</DialogTitle>
        </DialogHeader>
        <StoreInfoContent />
      </DialogContent>
    </Dialog>
  );
};
