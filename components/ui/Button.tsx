import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const variants = {
    primary:
      "bg-vino-gold text-vino-bg hover:bg-vino-goldLight disabled:cursor-not-allowed disabled:opacity-50",
    ghost:
      "bg-transparent text-vino-cream hover:bg-vino-border disabled:cursor-not-allowed disabled:opacity-50",
    outline:
      "border border-vino-borderHover bg-transparent text-vino-gold hover:bg-vino-gold hover:text-vino-bg disabled:cursor-not-allowed disabled:opacity-50"
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
