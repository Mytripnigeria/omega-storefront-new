import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface SkeletonStaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const SkeletonStagger = ({ children, className, delay = 0 }: SkeletonStaggerProps) => {
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
            staggerChildren: 0.08,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

interface SkeletonItemProps {
  children: ReactNode;
  className?: string;
}

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

export const SkeletonItem = ({ children, className }: SkeletonItemProps) => {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
    >
      {children}
    </motion.div>
  );
};

// Fade in wrapper for individual skeleton sections
interface SkeletonFadeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const SkeletonFade = ({ children, className, delay = 0 }: SkeletonFadeProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 24,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};
