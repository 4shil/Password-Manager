'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'framer-motion';

import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold tracking-wide ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden',
  {
    variants: {
      variant: {
        default: [
          'bg-[var(--yellow)] text-[#1a1a1a]',
          'border-[3px] border-[var(--border)]',
          'shadow-[var(--shadow-brutal)]',
        ].join(' '),
        destructive: [
          'bg-[var(--coral)] text-[#1a1a1a]',
          'border-[3px] border-[var(--border)]',
          'shadow-[var(--shadow-brutal)]',
        ].join(' '),
        outline: [
          'bg-[var(--surface)] text-[var(--text)]',
          'border-[3px] border-[var(--border)]',
          'shadow-[var(--shadow-brutal)]',
        ].join(' '),
        secondary: [
          'bg-[var(--lavender)] text-[#1a1a1a]',
          'border-[3px] border-[var(--border)]',
          'shadow-[var(--shadow-brutal)]',
        ].join(' '),
        ghost: [
          'bg-transparent text-[var(--text)]',
          'border-2 border-transparent',
          'hover:bg-[var(--muted)] hover:border-[var(--border)]',
        ].join(' '),
        link: 'text-[var(--text)] underline-offset-4 hover:underline font-bold',
        success: [
          'bg-[var(--mint)] text-[#1a1a1a]',
          'border-[3px] border-[var(--border)]',
          'shadow-[var(--shadow-brutal)]',
        ].join(' '),
        pink: [
          'bg-[var(--pink)] text-[#1a1a1a]',
          'border-[3px] border-[var(--border)]',
          'shadow-[var(--shadow-brutal)]',
        ].join(' '),
        sky: [
          'bg-[var(--sky)] text-[#1a1a1a]',
          'border-[3px] border-[var(--border)]',
          'shadow-[var(--shadow-brutal)]',
        ].join(' '),
      },
      size: {
        default: 'h-12 px-6 py-3 text-sm',
        sm: 'h-10 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
        xl: 'h-16 px-10 text-lg',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    const isGhostOrLink = variant === 'ghost' || variant === 'link';

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileHover={isGhostOrLink ? {} : {
          x: -3,
          y: -3,
        }}
        whileTap={isGhostOrLink ? { scale: 0.98 } : {
          x: 1,
          y: 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...(props as HTMLMotionProps<"button">)}
      >
        {/* Ripple effect */}
        <motion.span
          className="absolute inset-0 bg-white/30"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 2, opacity: 0.3 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ borderRadius: '50%', transformOrigin: 'center' }}
        />
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
