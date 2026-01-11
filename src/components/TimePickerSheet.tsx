import { X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useState, useMemo } from 'react';
import { format, addDays, isSameDay, startOfToday } from 'date-fns';

interface TimePickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const generateTimeSlots = (date: Date) => {
  const isToday = isSameDay(date, startOfToday());
  const slots = [
    ...(isToday ? [{ id: 'asap', label: 'ASAP', sublabel: '15-25 min' }] : []),
    { id: '1030', label: '10:30 AM', sublabel: format(date, 'EEE, MMM d') },
    { id: '1100', label: '11:00 AM', sublabel: format(date, 'EEE, MMM d') },
    { id: '1130', label: '11:30 AM', sublabel: format(date, 'EEE, MMM d') },
    { id: '1200', label: '12:00 PM', sublabel: format(date, 'EEE, MMM d') },
    { id: '1230', label: '12:30 PM', sublabel: format(date, 'EEE, MMM d') },
    { id: '1300', label: '1:00 PM', sublabel: format(date, 'EEE, MMM d') },
    { id: '1330', label: '1:30 PM', sublabel: format(date, 'EEE, MMM d') },
    { id: '1400', label: '2:00 PM', sublabel: format(date, 'EEE, MMM d') },
    { id: '1430', label: '2:30 PM', sublabel: format(date, 'EEE, MMM d') },
    { id: '1500', label: '3:00 PM', sublabel: format(date, 'EEE, MMM d') },
  ];
  return slots;
};

export const TimePickerSheet = ({ isOpen, onClose }: TimePickerSheetProps) => {
  const { selectedTime, setSelectedTime } = useCart();
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selected, setSelected] = useState(selectedTime || 'asap');

  // Generate 7 days for the day selector
  const days = useMemo(() => {
    const today = startOfToday();
    return Array.from({ length: 7 }, (_, i) => addDays(today, i));
  }, []);

  const timeSlots = useMemo(() => generateTimeSlots(selectedDate), [selectedDate]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    // Reset to first available slot when changing date
    const slots = generateTimeSlots(date);
    setSelected(slots[0]?.id || 'asap');
  };

  const handleConfirm = () => {
    const slot = timeSlots.find(s => s.id === selected);
    if (slot?.id === 'asap') {
      setSelectedTime('ASAP');
    } else if (slot) {
      setSelectedTime(`${slot.label}, ${format(selectedDate, 'EEE d')}`);
    }
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
          "fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-modal transition-transform duration-300 max-h-[80vh] flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border">
          <h2 className="text-lg font-bold">Select Date & Time</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Day Selector */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {days.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = index === 0;
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateChange(day)}
                  className={cn(
                    "flex flex-col items-center min-w-[60px] py-2 px-3 rounded-xl transition-all",
                    isSelected 
                      ? "bg-foreground text-background" 
                      : "bg-secondary hover:bg-secondary/80"
                  )}
                >
                  <span className="text-xs font-medium">
                    {isToday ? 'Today' : format(day, 'EEE')}
                  </span>
                  <span className="text-lg font-bold">
                    {format(day, 'd')}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {format(day, 'MMM')}
                  </span>
                </button>
              );
            })}
          </div>
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
        <div className="p-4 border-t border-border safe-bottom-pad">
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
