import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Clock, MapPin, Phone, Mail, Globe } from 'lucide-react';

interface StoreInfoSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const operatingHours = [
  { day: 'Monday', hours: '11:00 AM - 10:00 PM' },
  { day: 'Tuesday', hours: '11:00 AM - 10:00 PM' },
  { day: 'Wednesday', hours: '11:00 AM - 10:00 PM' },
  { day: 'Thursday', hours: '11:00 AM - 10:00 PM' },
  { day: 'Friday', hours: '11:00 AM - 11:00 PM' },
  { day: 'Saturday', hours: '10:00 AM - 11:00 PM' },
  { day: 'Sunday', hours: '10:00 AM - 9:00 PM' },
];

export const StoreInfoSheet = ({ isOpen, onClose }: StoreInfoSheetProps) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="text-xl">Store Information</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Operating Hours */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Operating Hours</h3>
            </div>
            <div className="space-y-2 pl-7">
              {operatingHours.map(({ day, hours }) => (
                <div 
                  key={day} 
                  className={`flex justify-between text-sm py-1.5 px-3 rounded-lg ${
                    day === today ? 'bg-primary/10 font-medium' : ''
                  }`}
                >
                  <span className={day === today ? 'text-primary' : 'text-muted-foreground'}>
                    {day}
                    {day === today && <span className="ml-2 text-xs">(Today)</span>}
                  </span>
                  <span>{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Location</h3>
            </div>
            <div className="pl-7 space-y-1">
              <p className="text-sm">123 Main Street, Downtown</p>
              <p className="text-sm text-muted-foreground">Lagos, Nigeria</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Contact</h3>
            </div>
            <div className="pl-7 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>hello@mrjollof.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>www.mrjollof.com</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Holiday hours may vary. Please call ahead to confirm.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
