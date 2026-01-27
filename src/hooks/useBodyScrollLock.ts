import { useEffect } from 'react';

export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    const scrollY = window.scrollY;
    
    if (isLocked) {
      document.body.classList.add('modal-open');
      document.body.style.top = `-${scrollY}px`;
    } else {
      document.body.classList.remove('modal-open');
      const top = document.body.style.top;
      document.body.style.top = '';
      
      // Restore scroll position
      if (top) {
        window.scrollTo(0, parseInt(top || '0') * -1);
      }
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
    };
  }, [isLocked]);
};
