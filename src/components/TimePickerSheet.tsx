import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

interface TimePickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const timeSlots = [
  { id: 'asap', label: 'ASAP', sublabel: '15-25 min' },
  { id: '1030', label: '10:30 AM', sublabel: 'Today' },
  { id: '1100', label: '11:00 AM', sublabel: 'Today' },
  { id: '1130', label: '11:30 AM', sublabel: 'Today' },
  { id: '1200', label: '12:00 PM', sublabel: 'Today' },
  { id: '1230', label: '12:30 PM', sublabel: 'Today' },
  { id: '1300', label: '1:00 PM', sublabel: 'Today' },
  { id: '1330', label: '1:30 PM', sublabel: 'Today' },
];

export const TimePickerSheet = ({ isOpen, onClose }: TimePickerSheetProps) => {
  const { selectedTime, setSelectedTime } = useCart();
  const [selected, setSelected] = useState(selectedTime || 'asap');

  const handleConfirm = () => {
    const slot = timeSlots.find(s => s.id === selected);
    setSelectedTime(slot?.id === 'asap' ? 'ASAP' : slot?.label || 'ASAP');
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
          "fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-modal transition-transform duration-300 max-h-[70vh] flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border">
          <h2 className="text-lg font-bold">Select Time</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Time Slots */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelected(slot.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                  selected === slot.id 
                    ? "border-foreground bg-secondary" 
                    : "border-border hover:bg-secondary/50"
                )}
              >
                <div className="text-left">
                  <p className="font-medium">{slot.label}</p>
                  <p className="text-sm text-muted-foreground">{slot.sublabel}</p>
                </div>
                {selected === slot.id && (
                  <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center">
                    <Check className="w-4 h-4 text-background" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="p-4 border-t border-border safe-bottom">
          <button
            onClick={handleConfirm}
            className="w-full h-12 bg-foreground text-background rounded-full font-semibold"
          >
            Confirm
          </button>
        </div>
      </div>
    </>
  );
};
