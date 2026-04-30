import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "ui-textarea min-h-28 w-full px-4 py-3 text-base leading-7",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
