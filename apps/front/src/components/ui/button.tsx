import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "danger" | "ghost" | "primary" | "secondary" | "tertiary";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  className?: string;
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  danger: "ui-button-danger",
  primary: "ui-button-primary",
  secondary: "ui-button-secondary",
  tertiary: "ui-button-tertiary",
  ghost: "ui-button-ghost",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 pl-4 pr-16 text-sm",
  lg: "h-16 pl-4 pr-20 text-base",
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
