import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold uppercase tracking-widest ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: [
          'bg-gradient-to-r from-[oklch(0.55_0.28_280)] to-[oklch(0.50_0.30_300)]',
          'border-[3px] border-[oklch(0.55_0.28_280)/0.5]',
          'text-white shadow-lg',
          'hover:border-[oklch(0.75_0.18_195)] hover:-translate-y-0.5',
          'hover:shadow-[0_0_20px_oklch(0.55_0.28_280/0.5),0_0_40px_oklch(0.50_0.30_300/0.3)]',
          'active:translate-y-0 active:shadow-none',
        ].join(' '),
        destructive: [
          'bg-gradient-to-r from-[oklch(0.60_0.25_25)] to-[oklch(0.65_0.28_340)]',
          'border-[3px] border-[oklch(0.60_0.25_25)/0.5]',
          'text-white shadow-lg',
          'hover:border-[oklch(0.60_0.25_25)] hover:-translate-y-0.5',
          'hover:shadow-[0_0_20px_oklch(0.60_0.25_25/0.5),0_0_40px_oklch(0.60_0.25_25/0.3)]',
          'active:translate-y-0 active:shadow-none',
        ].join(' '),
        outline: [
          'border-[3px] border-[oklch(0.55_0.28_280)]',
          'bg-transparent text-[oklch(0.75_0.18_195)]',
          'hover:bg-[oklch(0.55_0.28_280)/0.1]',
          'hover:shadow-[0_0_20px_oklch(0.55_0.28_280/0.3)]',
        ].join(' '),
        secondary: [
          'bg-[oklch(0.18_0.02_270)]',
          'border-[3px] border-[oklch(0.25_0.02_270)]',
          'text-[oklch(0.75_0.02_270)]',
          'hover:border-[oklch(0.45_0.02_270)] hover:text-white',
        ].join(' '),
        ghost: [
          'border-2 border-transparent',
          'text-[oklch(0.75_0.18_195)]',
          'hover:border-[oklch(0.75_0.18_195)/0.3]',
          'hover:bg-[oklch(0.75_0.18_195)/0.1]',
        ].join(' '),
        link: 'text-[oklch(0.75_0.18_195)] underline-offset-4 hover:underline',
        neon: [
          'bg-transparent',
          'border-[3px] border-[oklch(0.75_0.18_195)]',
          'text-[oklch(0.75_0.18_195)]',
          'shadow-[inset_0_0_10px_oklch(0.75_0.18_195/0.2),0_0_20px_oklch(0.75_0.18_195/0.3)]',
          'hover:bg-[oklch(0.75_0.18_195)/0.1]',
          'hover:shadow-[inset_0_0_15px_oklch(0.75_0.18_195/0.3),0_0_30px_oklch(0.75_0.18_195/0.5)]',
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
