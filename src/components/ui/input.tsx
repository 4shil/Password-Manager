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
          'flex h-12 w-full px-4 py-3 text-sm',
          // Colors
          'bg-white text-[#1a1a1a]',
          'placeholder:text-[#999999]',
          // Border
          'border-[3px] border-[#1a1a1a]',
          // Focus
          'focus-visible:outline-none',
          'focus-visible:ring-[3px] focus-visible:ring-[#FFE156]',
          // Transition
          'transition-all duration-200',
          // Disabled
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F5F5F5]',
          // File input
          'file:border-0 file:bg-[#FFE156] file:text-[#1a1a1a] file:text-sm file:font-bold file:mr-4 file:px-4 file:py-2',
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
