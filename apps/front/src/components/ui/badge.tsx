import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type BadgeTone = "default" | "success" | "muted";

const toneClasses: Record<BadgeTone, string> = {
  default: "ui-badge-default",
  success: "ui-badge-success",
  muted: "ui-badge-muted",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({
  className,
  tone = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
