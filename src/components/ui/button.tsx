import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium select-none disabled:pointer-events-none disabled:opacity-38 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg transition-[transform,background-color,color,opacity,box-shadow] duration-150 ease-out active:not-disabled:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary hover:bg-brand-deep hover:text-brand-deep-fg",
        secondary:
          "bg-secondary-container text-on-secondary-container hover:bg-primary-container hover:text-on-primary-container",
        outline:
          "bg-transparent text-fg ring-1 ring-outline hover:bg-surface-low",
        ghost: "bg-transparent text-muted hover:text-fg hover:bg-surface-low",
        danger: "bg-error text-on-error hover:opacity-90",
        huge: "bg-secondary text-on-secondary shadow-cta hover:brightness-[0.96]",
        hugeStop: "bg-brand-deep text-brand-deep-fg shadow-cta-stop hover:brightness-[0.96]",
      },
      size: {
        sm: "h-12 min-h-12 rounded-md px-4 text-sm",
        md: "h-12 min-h-12 rounded-md px-4 text-sm",
        lg: "h-14 min-h-14 rounded-lg px-5 text-base",
        huge: "h-20 w-full rounded-xl text-xl font-bold tracking-wide",
        icon: "size-12 min-h-12 min-w-12 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
