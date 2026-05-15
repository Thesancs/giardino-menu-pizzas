"use client";

import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters";
import type { Prato } from "@/types";

interface PratoCardProps {
  prato: Prato;
  onAdd: (prato: Prato) => void;
  onOpen: (prato: Prato) => void;
}

export function PratoCard({ prato, onAdd, onOpen }: PratoCardProps) {
  return (
    <article
      className="group relative cursor-pointer overflow-hidden border border-vino-border bg-vino-card transition duration-200 hover:-translate-y-0.5 hover:border-vino-borderHover hover:bg-vino-hover"
      onClick={() => onOpen(prato)}
    >
      <div className="relative h-[185px] overflow-hidden">
        <img
          alt={prato.nome}
          className="h-full w-full object-cover brightness-90 saturate-90 transition duration-300 group-hover:scale-[1.03] group-hover:brightness-100 group-hover:saturate-100"
          src={prato.fotoUrl}
        />
        {prato.badge ? <Badge className="absolute left-3 top-3">{prato.badge}</Badge> : null}
      </div>
      <div className="p-5">
        <h3 className="mb-2 font-display text-2xl font-semibold leading-tight text-vino-cream">
          {prato.nome}
        </h3>
        <p className="mb-5 line-clamp-3 text-sm font-light leading-relaxed text-vino-muted">
          {prato.descricao}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-display text-3xl font-semibold text-vino-gold">
            {formatCurrency(prato.preco)}
          </span>
          <button
            aria-label={`Adicionar ${prato.nome}`}
            className="grid h-9 w-9 place-items-center border border-vino-borderHover text-2xl leading-none text-vino-gold transition hover:border-vino-gold hover:bg-vino-gold hover:text-vino-bg"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAdd(prato);
            }}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}
