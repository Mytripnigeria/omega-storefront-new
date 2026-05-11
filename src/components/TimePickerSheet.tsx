import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useMemo, useState } from "react";
import { addDays, format, isSameDay, startOfToday } from "date-fns";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useStoreAvailability } from "@/hooks/useStoreAvailability";

interface TimePickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ASAP_ID = "asap";

export const TimePickerSheet = ({ isOpen, onClose }: TimePickerSheetProps) => {
  useBodyScrollLock(isOpen);

  const { selectedTime, setSelectedTime, storeId } = useCart();
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedSlot, setSelectedSlot] = useState<string>(
    selectedTime || ASAP_ID,
  );

  const days = useMemo(() => {
    const today = startOfToday();
    return Array.from({ length: 7 }, (_, i) => addDays(today, i));
  }, []);

  const isoDate = format(selectedDate, "yyyy-MM-dd");
  const { data, isLoading, error } = useStoreAvailability(
    storeId,
    isoDate,
  );

  const handleConfirm = () => {
    if (selectedSlot === ASAP_ID) {
      setSelectedTime("ASAP");
    } else {
      setSelectedTime(selectedSlot);
    }
    onClose();
  };

  const slots = data?.slots ?? [];
  const asapAvailable = data?.asapAvailable ?? false;
  const noOptions =
    !isLoading && !error && slots.length === 0 && !asapAvailable;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-foreground/50 z-50 transition-opacity duration-300 safari-fix",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed z-50 bg-card shadow-none border border-border transition-all duration-300 flex flex-col safari-fix",
          "inset-x-0 bottom-0 rounded-t-3xl max-h-[80vh]",
          isOpen ? "translate-y-0" : "translate-y-full",
          "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:rounded-2xl lg:w-full lg:max-w-md lg:max-h-[70vh]",
          isOpen
            ? "lg:-translate-y-1/2 lg:opacity-100"
            : "lg:-translate-y-1/2 lg:opacity-0 lg:pointer-events-none",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border">
          <h2 className="text-lg font-bold">Select Date & Time</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {days.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = index === 0;
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    setSelectedDate(day);
                    setSelectedSlot(ASAP_ID);
                  }}
                  className={cn(
                    "flex flex-col items-center min-w-[60px] py-2 px-3 rounded-xl transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80",
                  )}
                >
                  <span className="text-xs font-medium">
                    {isToday ? "Today" : format(day, "EEE")}
                  </span>
                  <span className="text-lg font-bold">{format(day, "d")}</span>
                  <span className="text-[10px] opacity-70">
                    {format(day, "MMM")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!storeId ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Pick a store first to see available times.
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Loading availability…
            </p>
          ) : error ? (
            <p className="text-sm text-destructive text-center py-6">
              Couldn't load slots — please try again.
            </p>
          ) : noOptions ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Closed on this day. Try another date.
            </p>
          ) : (
            <div className="space-y-2">
              {asapAvailable && (
                <button
                  onClick={() => setSelectedSlot(ASAP_ID)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                    selectedSlot === ASAP_ID
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary/50",
                  )}
                >
                  <div className="text-left">
                    <p className="font-medium">ASAP</p>
                    <p className="text-sm text-muted-foreground">
                      Start now — typical 15-25 min
                    </p>
                  </div>
                  {selectedSlot === ASAP_ID && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              )}
              {slots.map((slot) => {
                const start = new Date(slot.startsAt);
                const label = format(start, "h:mm a");
                const sub = format(start, "EEE, MMM d");
                return (
                  <button
                    key={slot.startsAt}
                    onClick={() => setSelectedSlot(slot.startsAt)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                      selectedSlot === slot.startsAt
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-secondary/50",
                    )}
                  >
                    <div className="text-left">
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{sub}</p>
                    </div>
                    {selectedSlot === slot.startsAt && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border safe-bottom-pad">
          <button
            onClick={handleConfirm}
            disabled={noOptions || isLoading || !!error || !storeId}
            className="w-full h-12 bg-primary text-primary-foreground rounded-full font-semibold disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      </div>
    </>
  );
};
