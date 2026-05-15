"use client";

import { useCarrinho } from "@/hooks/useCarrinho";
import type { Restaurante } from "@/types";

interface HeaderProps {
  restaurante: Restaurante;
  onCartOpen: () => void;
}

export function Header({ restaurante, onCartOpen }: HeaderProps) {
  const quantidadeTotal = useCarrinho((state) => state.quantidadeTotal());

  return (
    <header className="sticky top-0 z-[100] border-b border-vino-border bg-vino-bg/90 px-4 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex h-[70px] max-w-[1100px] items-center justify-between gap-4">
        <div className="flex shrink-0 flex-col leading-none">
          <span className="font-display text-2xl font-semibold tracking-[0.06em] text-vino-gold">
            {restaurante.nome}
          </span>
          <span className="mt-1 text-[0.6rem] uppercase tracking-[0.32em] text-vino-muted">
            {restaurante.subtitulo}
          </span>
        </div>
        <div className="hidden h-8 w-px shrink-0 bg-vino-border sm:block" />
        <div className="hidden flex-1 text-xs tracking-[0.05em] text-vino-muted sm:block">
          {restaurante.horario}
        </div>
        <button
          className="flex shrink-0 items-center gap-2 bg-vino-gold px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] text-vino-bg transition hover:bg-vino-goldLight sm:px-5"
          type="button"
          onClick={onCartOpen}
        >
          <span className="hidden sm:inline">Pedido</span>
          <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-vino-bg text-[0.68rem] text-vino-gold">
            {quantidadeTotal}
          </span>
        </button>
      </div>
    </header>
  );
}
