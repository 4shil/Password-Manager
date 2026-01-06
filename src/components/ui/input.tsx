import * as React from 'react';

import { cn } from '@/lib/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex h-12 w-full px-4 py-3 text-sm font-mono',
          // Colors
          'bg-[oklch(0.05_0.005_270)] text-white',
          'placeholder:text-[oklch(0.45_0.02_270)] placeholder:italic',
          // Border
          'border-2 border-[oklch(0.25_0.02_270)]',
          // Focus
          'focus-visible:outline-none focus-visible:border-[oklch(0.75_0.18_195)]',
          'focus-visible:shadow-[0_0_20px_oklch(0.75_0.18_195/0.3),inset_0_0_20px_oklch(0.75_0.18_195/0.1)]',
          // Caret
          'caret-[oklch(0.75_0.18_195)]',
          // Transition
          'transition-all duration-200',
          // File input
          'file:border-0 file:bg-[oklch(0.55_0.28_280)] file:text-white file:text-sm file:font-bold file:uppercase file:tracking-widest file:mr-4 file:px-4 file:py-2',
          // Disabled
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
