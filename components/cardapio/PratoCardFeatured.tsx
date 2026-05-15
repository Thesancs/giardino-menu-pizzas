"use client";

import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters";
import type { Prato } from "@/types";

interface PratoCardFeaturedProps {
  prato: Prato;
  onAdd: (prato: Prato) => void;
  onOpen: (prato: Prato) => void;
}

export function PratoCardFeatured({ prato, onAdd, onOpen }: PratoCardFeaturedProps) {
  return (
    <article
      className="group grid cursor-pointer overflow-hidden border border-vino-border bg-vino-card transition duration-200 hover:-translate-y-0.5 hover:border-vino-borderHover hover:bg-vino-hover md:grid-cols-[360px_1fr]"
      onClick={() => onOpen(prato)}
    >
      <div className="relative h-[220px] overflow-hidden md:h-full md:min-h-[230px]">
        <img
          alt={prato.nome}
          className="h-full w-full object-cover brightness-90 saturate-90 transition duration-300 group-hover:scale-[1.03] group-hover:brightness-100 group-hover:saturate-100"
          src={prato.fotoUrl}
        />
        {prato.badge ? <Badge className="absolute left-3 top-3">{prato.badge}</Badge> : null}
      </div>
      <div className="flex flex-col justify-between p-6">
        <div>
          <p className="mb-2 font-display text-sm italic text-vino-goldDim">
            Sugestao da casa
          </p>
          <h3 className="mb-3 font-display text-3xl font-semibold leading-tight text-vino-cream">
            {prato.nome}
          </h3>
          <p className="text-sm font-light leading-relaxed text-vino-muted">{prato.descricao}</p>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <span className="font-display text-3xl font-semibold text-vino-gold">
            {formatCurrency(prato.preco)}
          </span>
          <button
            aria-label={`Adicionar ${prato.nome}`}
            className="grid h-10 w-10 place-items-center border border-vino-borderHover text-2xl leading-none text-vino-gold transition hover:border-vino-gold hover:bg-vino-gold hover:text-vino-bg"
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
