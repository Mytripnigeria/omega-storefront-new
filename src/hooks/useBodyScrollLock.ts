import { useLayoutEffect, useRef } from 'react';

export const useBodyScrollLock = (isLocked: boolean) => {
  const scrollYRef = useRef(0);
  const wasLockedRef = useRef(false);

  const restoreScrollInstant = (y: number) => {
    const el = document.documentElement;
    const prev = el.style.scrollBehavior;

    // App-wide CSS sets `html { scroll-behavior: smooth; }`, which would animate scroll restoration.
    // For modal close, we want an instantaneous restore with no visible "roll".
    el.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);
    el.style.scrollBehavior = prev;
  };

  useLayoutEffect(() => {
    // Transitioning from unlocked to locked
    if (isLocked && !wasLockedRef.current) {
      scrollYRef.current = window.scrollY;
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.classList.add('modal-open');
      wasLockedRef.current = true;
    } 
    // Transitioning from locked to unlocked
    else if (!isLocked && wasLockedRef.current) {
      // While locked, the scroll position is encoded in body.style.top (e.g. "-123px").
      // Using it here is more reliable than window.scrollY, which is typically 0 when body is fixed.
      const top = document.body.style.top;
      const parsed = top ? Math.abs(parseInt(top, 10)) : scrollYRef.current;

      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      wasLockedRef.current = false;

      // Restore scroll synchronously (useLayoutEffect runs before paint), so there is no visible jump.
      // Force a reflow so the browser applies the "unfixed" body styles before we scroll.
      void document.body.offsetHeight;
      restoreScrollInstant(parsed);
    }

    return () => {
      if (wasLockedRef.current) {
        const top = document.body.style.top;
        const parsed = top ? Math.abs(parseInt(top, 10)) : scrollYRef.current;
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        wasLockedRef.current = false;

        // If we unmount while still locked (rare), ensure the page returns to the original scroll position.
        void document.body.offsetHeight;
        restoreScrollInstant(parsed);
      }
    };
  }, [isLocked]);
};
