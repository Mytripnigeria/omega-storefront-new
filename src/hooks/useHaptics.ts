import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

export const useHaptics = () => {
  const vibrate = useCallback((pattern: HapticPattern = 'light') => {
    if (!navigator.vibrate) return;

    const patterns: Record<HapticPattern, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: 50,
      success: [10, 50, 30],
      error: [50, 30, 50],
      selection: 5,
    };

    try {
      navigator.vibrate(patterns[pattern]);
    } catch {
      // Silently fail if vibration is not supported
    }
  }, []);

  const triggerHaptic = useCallback((pattern: HapticPattern = 'light') => {
    vibrate(pattern);
  }, [vibrate]);

  return { triggerHaptic };
};
