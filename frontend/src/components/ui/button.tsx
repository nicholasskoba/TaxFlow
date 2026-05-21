import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-700 text-white hover:bg-brand-600",
  secondary: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  ghost: "text-slate-700 hover:bg-slate-100"
};

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 ${variantClasses[variant]} ${className}`}
      type={type}
      {...props}
    />
  );
}
