"use client";

import Image from "next/image";
import logoImage from "@/assets/Giardino-Logo.jpg";
import { useCarrinho } from "@/hooks/useCarrinho";
import type { Restaurante } from "@/types";

interface HeaderProps {
  restaurante: Restaurante;
  onCartOpen: () => void;
}

export function Header({ restaurante, onCartOpen }: HeaderProps) {
  const quantidadeTotal = useCarrinho((state) => state.quantidadeTotal());

  return (
    <header className="sticky top-0 z-[100] border-b border-vino-border bg-vino-surface/88 px-4 shadow-[0_10px_30px_rgba(65,46,20,0.06)] backdrop-blur-xl md:px-8">
      <div className="mx-auto flex h-[70px] max-w-[1100px] items-center justify-between gap-4">
        <div className="flex min-w-0 shrink-0 items-center gap-3 leading-none">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-vino-gold/50 bg-vino-cream">
            <Image src={logoImage} alt={`Logo ${restaurante.nome}`} fill sizes="44px" className="object-cover" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-display text-xl font-semibold tracking-[0.06em] text-vino-cream sm:text-2xl">
              {restaurante.nome}
            </span>
            <span className="mt-1 truncate text-[0.58rem] uppercase tracking-[0.28em] text-vino-muted">
              {restaurante.subtitulo}
            </span>
          </div>
        </div>
        <div className="hidden h-8 w-px shrink-0 bg-vino-border sm:block" />
        <div className="hidden flex-1 text-xs tracking-[0.05em] text-vino-muted md:block">
          {restaurante.horario}
        </div>
        <button
          className="flex shrink-0 items-center gap-2 border border-vino-gold/60 bg-vino-gold px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#102f23] transition hover:bg-vino-goldLight sm:px-5"
          type="button"
          onClick={onCartOpen}
        >
          <span className="hidden sm:inline">Pedido</span>
          <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-vino-cream text-[0.68rem] text-vino-gold">
            {quantidadeTotal}
          </span>
        </button>
      </div>
    </header>
  );
}
