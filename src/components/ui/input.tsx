import * as React from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <motion.input
        type={type}
        className={cn(
          // Base styles
          'flex h-12 w-full px-4 py-3 text-sm',
          // Colors
          'bg-[var(--surface)] text-[var(--text)]',
          'placeholder:text-[var(--text-light)]',
          // Border
          'border-[3px] border-[var(--border)]',
          // Focus
          'focus-visible:outline-none',
          'focus-visible:ring-[4px] focus-visible:ring-[var(--yellow)]',
          // Transition
          'transition-all duration-200',
          // File input
          'file:border-0 file:bg-[var(--yellow)] file:text-[#1a1a1a] file:text-sm file:font-bold file:mr-4 file:px-4 file:py-2',
          // Disabled
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        whileFocus={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
