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

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-normal leading-4 tracking-[0.32px]",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
