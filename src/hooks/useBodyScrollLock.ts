import { useEffect, useRef } from 'react';

export const useBodyScrollLock = (isLocked: boolean) => {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (isLocked) {
      // Store current scroll position before locking
      scrollYRef.current = window.scrollY;
      document.body.classList.add('modal-open');
      document.body.style.top = `-${scrollYRef.current}px`;
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      
      // Restore scroll position from ref
      if (scrollYRef.current > 0) {
        window.scrollTo(0, scrollYRef.current);
      }
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
    };
  }, [isLocked]);
};
