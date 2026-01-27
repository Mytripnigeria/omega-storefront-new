import { useLayoutEffect, useRef } from 'react';

export const useBodyScrollLock = (isLocked: boolean) => {
  const scrollYRef = useRef(0);
  const wasLockedRef = useRef(false);

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
      
      // Use requestAnimationFrame to restore scroll after layout settles
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, parsed);
        });
      });
    }

    return () => {
      if (wasLockedRef.current) {
        const top = document.body.style.top;
        const parsed = top ? Math.abs(parseInt(top, 10)) : scrollYRef.current;
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        wasLockedRef.current = false;

        // If we unmount while still locked (rare), ensure the page returns to the original scroll position.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo(0, parsed);
          });
        });
      }
    };
  }, [isLocked]);
};
