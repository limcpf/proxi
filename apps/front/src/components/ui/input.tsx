import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "ui-input h-12 w-full rounded-2xl px-4 text-sm",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
