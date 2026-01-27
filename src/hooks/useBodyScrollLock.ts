import { useEffect, useRef } from 'react';

export const useBodyScrollLock = (isLocked: boolean) => {
  const scrollYRef = useRef(0);
  const wasLockedRef = useRef(false);

  useEffect(() => {
    // Transitioning from unlocked to locked
    if (isLocked && !wasLockedRef.current) {
      scrollYRef.current = window.scrollY;
      document.body.classList.add('modal-open');
      document.body.style.top = `-${scrollYRef.current}px`;
      wasLockedRef.current = true;
    } 
    // Transitioning from locked to unlocked
    else if (!isLocked && wasLockedRef.current) {
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      wasLockedRef.current = false;
      
      // Use requestAnimationFrame to restore scroll after layout settles
      const scrollY = scrollYRef.current;
      if (scrollY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
      }
    }

    return () => {
      if (wasLockedRef.current) {
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        wasLockedRef.current = false;
      }
    };
  }, [isLocked]);
};
