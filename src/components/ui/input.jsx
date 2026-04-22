import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef((props, ref) => {
  const { className, type = "text", ...rest } = props;

  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none",
        className
      )}
      {...rest}
    />
  );
});

Input.displayName = "Input";

export { Input };