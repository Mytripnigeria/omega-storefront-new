import { motion, Transition, Variants } from 'framer-motion';
import { ReactNode, createContext, useContext } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const pageTransition: Transition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.3,
};

// Context to provide stagger delay to children
const StaggerContext = createContext<number>(0);

export const useStaggerDelay = (index: number) => {
  const baseDelay = useContext(StaggerContext);
  return baseDelay + index * 0.05;
};

export const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <StaggerContext.Provider value={0.1}>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </StaggerContext.Provider>
  );
};

// Staggered container for lists/grids
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const StaggerContainer = ({ children, className, delay = 0 }: StaggerContainerProps) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.06,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

// Staggered item for use inside StaggerContainer
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 12,
    scale: 0.98,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

export const StaggerItem = ({ children, className }: StaggerItemProps) => {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
    >
      {children}
    </motion.div>
  );
};

// Fade-in section for individual content blocks
interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const FadeInSection = ({ 
  children, 
  className, 
  delay = 0,
  direction = 'up' 
}: FadeInSectionProps) => {
  const directionOffset = {
    up: { y: 16, x: 0 },
    down: { y: -16, x: 0 },
    left: { y: 0, x: 16 },
    right: { y: 0, x: -16 },
    none: { y: 0, x: 0 },
  };

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        ...directionOffset[direction],
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        x: 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};
