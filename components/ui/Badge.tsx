import type { ReactNode } from "react";

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex border border-vino-gold/50 bg-vino-gold/15 px-3 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-vino-goldDim ${className}`}
    >
      {children}
    </span>
  );
}
