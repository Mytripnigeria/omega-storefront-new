import { useState, useRef, useCallback, ReactNode } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export const PullToRefresh = ({ 
  children, 
  onRefresh, 
  threshold = 80 
}: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const controls = useAnimation();
  const y = useMotionValue(0);
  
  const pullProgress = useTransform(y, [0, threshold], [0, 1]);
  const rotation = useTransform(y, [0, threshold], [0, 180]);
  const opacity = useTransform(y, [0, threshold * 0.3, threshold], [0, 0.5, 1]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Only enable pull-to-refresh when scrolled to top
    if (container.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      setIsPulling(false);
      y.set(0);
      return;
    }
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      // Apply resistance - the further you pull, the harder it gets
      const resistance = 0.4;
      const pullDistance = Math.min(diff * resistance, threshold * 1.5);
      y.set(pullDistance);
    }
  }, [isPulling, isRefreshing, threshold, y]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    const currentY = y.get();
    
    if (currentY >= threshold && !isRefreshing) {
      // Trigger refresh
      setIsRefreshing(true);
      await controls.start({ y: threshold * 0.6, transition: { duration: 0.2 } });
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        await controls.start({ y: 0, transition: { duration: 0.3, ease: 'easeOut' } });
        y.set(0);
      }
    } else {
      // Snap back
      await controls.start({ y: 0, transition: { duration: 0.3, ease: 'easeOut' } });
      y.set(0);
    }
  }, [isPulling, isRefreshing, threshold, onRefresh, controls, y]);

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-auto overscroll-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div 
        className="absolute left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
        style={{ 
          top: useTransform(y, (v) => v - 48),
          opacity 
        }}
      >
        <motion.div 
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shadow-lg"
          style={{ rotate: isRefreshing ? undefined : rotation }}
          animate={isRefreshing ? { rotate: 360 } : undefined}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : undefined}
        >
          <RefreshCw className="w-5 h-5 text-foreground" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        animate={controls}
        style={{ y: isPulling ? y : undefined }}
      >
        {children}
      </motion.div>
    </div>
  );
};
