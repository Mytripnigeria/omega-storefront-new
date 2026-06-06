import { format, isToday, isTomorrow } from "date-fns";

/**
 * Human-friendly schedule label for a selected order time.
 *   same day  -> "Today, 10:30 AM"
 *   next day  -> "Tomorrow, 10:30 AM"
 *   later     -> "May 31, 10:30 AM"
 * "ASAP"/empty passes through unchanged.
 */
export function formatScheduleTime(value?: string | null): string {
  if (!value || value === "ASAP") return "ASAP";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const time = format(d, "h:mm a");
  if (isToday(d)) return `Today, ${time}`;
  if (isTomorrow(d)) return `Tomorrow, ${time}`;
  return `${format(d, "MMM d")}, ${time}`;
}

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type OpeningHours = Record<
  string,
  { open: string; close: string; closed: boolean }
> | null;

export interface StoreStatus {
  isOpen: boolean;
  /** e.g. "Open · Closes 10pm" or "Closed · Opens 10am" */
  label: string;
}

/** "21:00" -> "9pm", "10:30" -> "10:30am" */
function formatClock(hhmm: string): string {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h)) return hhmm;
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour12}:${String(m).padStart(2, "0")}${period}` : `${hour12}${period}`;
}

const toMins = (s: string) => {
  const [h, m] = s.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
};

/**
 * Derives the live open/closed status from a store's weekly opening hours.
 * Returns null when no hours are configured (caller can fall back to a generic
 * status).
 */
export function getStoreStatus(openingHours: OpeningHours): StoreStatus | null {
  if (!openingHours) return null;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const today = openingHours[DAY_KEYS[now.getDay()]];

  if (today && !today.closed) {
    const openM = toMins(today.open);
    const closeM = toMins(today.close);
    if (nowMins >= openM && nowMins < closeM) {
      return { isOpen: true, label: `Open · Closes ${formatClock(today.close)}` };
    }
    if (nowMins < openM) {
      return { isOpen: false, label: `Closed · Opens ${formatClock(today.open)}` };
    }
  }

  // Closed now — find the next day that opens within the coming week.
  for (let i = 1; i <= 7; i++) {
    const next = openingHours[DAY_KEYS[(now.getDay() + i) % 7]];
    if (next && !next.closed) {
      return { isOpen: false, label: `Closed · Opens ${formatClock(next.open)}` };
    }
  }
  return { isOpen: false, label: "Closed" };
}
