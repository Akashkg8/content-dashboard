'use client';

import { motion } from 'motion/react';
import { type ReactNode } from 'react';

/**
 * Section transition. A template remounts on every navigation, so each page
 * fades and rises in. MotionConfig in Providers turns this off for users who
 * ask for reduced motion.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
