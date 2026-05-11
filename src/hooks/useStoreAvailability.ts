import { useEffect, useState } from "react";
import {
  availabilityApi,
  type StoreAvailability,
} from "@/services/availability";

/**
 * Loads slot availability for the given store on the given ISO date.
 * Returns `null` until first response. Re-fires when storeId or date change.
 */
export function useStoreAvailability(
  storeId: string | null,
  date: string,
): { data: StoreAvailability | null; isLoading: boolean; error: Error | null } {
  const [data, setData] = useState<StoreAvailability | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!storeId);

  useEffect(() => {
    if (!storeId) {
      setData(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    availabilityApi
      .forStore(storeId, date)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId, date]);

  return { data, isLoading, error };
}
