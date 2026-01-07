import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold tracking-wide ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE156] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: [
          'bg-[#FFE156] text-[#1a1a1a]',
          'border-[3px] border-[#1a1a1a]',
          'shadow-[4px_4px_0_#1a1a1a]',
          'transition-all duration-200',
          'hover:bg-[#FFD426] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#1a1a1a]',
          'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_#1a1a1a]',
        ].join(' '),
        destructive: [
          'bg-[#FF8A80] text-[#1a1a1a]',
          'border-[3px] border-[#1a1a1a]',
          'shadow-[4px_4px_0_#1a1a1a]',
          'transition-all duration-200',
          'hover:bg-[#FF6B5B] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#1a1a1a]',
          'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_#1a1a1a]',
        ].join(' '),
        outline: [
          'bg-white text-[#1a1a1a]',
          'border-[3px] border-[#1a1a1a]',
          'shadow-[4px_4px_0_#1a1a1a]',
          'transition-all duration-200',
          'hover:bg-[#FFE156] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#1a1a1a]',
          'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_#1a1a1a]',
        ].join(' '),
        secondary: [
          'bg-[#C4B5FD] text-[#1a1a1a]',
          'border-[3px] border-[#1a1a1a]',
          'shadow-[4px_4px_0_#1a1a1a]',
          'transition-all duration-200',
          'hover:bg-[#A78BFA] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#1a1a1a]',
          'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_#1a1a1a]',
        ].join(' '),
        ghost: [
          'bg-transparent text-[#1a1a1a]',
          'border-2 border-transparent',
          'transition-all duration-200',
          'hover:bg-[#F5F5F5] hover:border-[#1a1a1a]',
        ].join(' '),
        link: 'text-[#1a1a1a] underline-offset-4 hover:underline font-bold',
        success: [
          'bg-[#A0F5D3] text-[#1a1a1a]',
          'border-[3px] border-[#1a1a1a]',
          'shadow-[4px_4px_0_#1a1a1a]',
          'transition-all duration-200',
          'hover:bg-[#7EEDC0] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#1a1a1a]',
          'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_#1a1a1a]',
        ].join(' '),
        pink: [
          'bg-[#FF6B9D] text-[#1a1a1a]',
          'border-[3px] border-[#1a1a1a]',
          'shadow-[4px_4px_0_#1a1a1a]',
          'transition-all duration-200',
          'hover:bg-[#FF4785] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#1a1a1a]',
          'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_#1a1a1a]',
        ].join(' '),
        sky: [
          'bg-[#7DD3FC] text-[#1a1a1a]',
          'border-[3px] border-[#1a1a1a]',
          'shadow-[4px_4px_0_#1a1a1a]',
          'transition-all duration-200',
          'hover:bg-[#53C4FC] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#1a1a1a]',
          'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_#1a1a1a]',
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
