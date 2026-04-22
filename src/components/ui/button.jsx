import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border bg-white hover:bg-gray-100",
        secondary: "bg-gray-200 hover:bg-gray-300",
        ghost: "hover:bg-gray-100",
        link: "text-blue-500 underline hover:text-blue-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef((props, ref) => {
  const { className, variant, size, asChild = false, ...rest } = props;

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...rest}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };