import type { ReactNode } from "react";

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex bg-vino-gold px-3 py-1 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-vino-bg ${className}`}
    >
      {children}
    </span>
  );
}
