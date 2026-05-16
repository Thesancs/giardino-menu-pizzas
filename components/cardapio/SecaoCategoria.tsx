"use client";

import { PratoCard } from "@/components/cardapio/PratoCard";
import { PratoCardFeatured } from "@/components/cardapio/PratoCardFeatured";
import type { Categoria, Prato } from "@/types";

interface SecaoCategoriaProps {
  categoria: Categoria;
  pratos: Prato[];
  onAdd: (prato: Prato) => void;
  onOpen: (prato: Prato) => void;
}

export function SecaoCategoria({ categoria, pratos, onAdd, onOpen }: SecaoCategoriaProps) {
  return (
    <section className="mb-14 scroll-mt-36" id={`sec-${categoria.id}`}>
      <div className="mb-2 flex items-baseline gap-5">
        <h2 className="font-display text-4xl font-normal italic text-vino-cream">
          {categoria.nome}
        </h2>
        <div className="h-px flex-1 bg-vino-border" />
        <span className="text-[0.68rem] uppercase tracking-[0.15em] text-vino-muted">
          {pratos.length} opções
        </span>
      </div>
      <div className="mb-6 h-px w-20 bg-vino-gold" />
      <div className="grid grid-cols-1 gap-5">
        {pratos.map((prato) =>
          prato.destaque ? (
            <div key={prato.id}>
              <PratoCardFeatured prato={prato} onAdd={onAdd} onOpen={onOpen} />
            </div>
          ) : (
            <PratoCard key={prato.id} prato={prato} onAdd={onAdd} onOpen={onOpen} />
          )
        )}
      </div>
    </section>
  );
}
