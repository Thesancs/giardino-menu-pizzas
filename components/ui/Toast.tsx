"use client";

interface ToastProps {
  message: string;
  visible: boolean;
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-[300] max-w-[calc(100vw-2rem)] -translate-x-1/2 whitespace-nowrap bg-vino-gold px-5 py-3 text-xs font-medium uppercase tracking-[0.08em] text-[#102f23] transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-28"
      }`}
    >
      {message}
    </div>
  );
}
