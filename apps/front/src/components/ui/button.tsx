import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  className?: string;
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "ui-button-primary",
  secondary: "ui-button-secondary",
  ghost: "ui-button-ghost",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 rounded-xl px-3 text-sm",
  md: "h-11 rounded-2xl px-4 text-sm",
  lg: "h-12 rounded-2xl px-5 text-sm",
};

export function Button({
  asChild = false,
  className,
  children,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "ui-button",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
