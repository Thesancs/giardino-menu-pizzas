"use client";

import { type MouseEvent, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  aplicarBordaRecheada,
  permiteBordaRecheada,
  saboresBordaRecheada
} from "@/lib/borda-recheada";
import { formatCurrency } from "@/lib/formatters";
import type { Prato } from "@/types";

interface PratoCardFeaturedProps {
  prato: Prato;
  onAdd: (prato: Prato) => void;
  onOpen: (prato: Prato) => void;
}

export function PratoCardFeatured({ prato, onAdd, onOpen }: PratoCardFeaturedProps) {
  const [bordaRecheada, setBordaRecheada] = useState(false);
  const [saborBorda, setSaborBorda] = useState(saboresBordaRecheada[0]);
  const exibeBorda = permiteBordaRecheada(prato);

  function addPrato(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onAdd(bordaRecheada ? aplicarBordaRecheada(prato, saborBorda) : prato);
  }

  return (
    <article
      className="group grid cursor-pointer overflow-hidden border border-vino-border bg-[linear-gradient(135deg,rgba(214,163,58,0.16),rgba(255,253,247,0.96)_42%,rgba(242,232,208,0.92))] shadow-vino transition duration-200 hover:-translate-y-0.5 hover:border-vino-borderHover md:grid-cols-[190px_1fr]"
      onClick={() => onOpen(prato)}
    >
      <div className="relative hidden min-h-[230px] place-items-center border-r border-vino-border bg-vino-bg/45 md:grid">
        <div className="grid h-24 w-24 place-items-center rounded-full border border-vino-gold/50 bg-vino-surface font-display text-5xl italic text-vino-gold">
          G
        </div>
        {prato.badge ? <Badge className="absolute left-3 top-3">{prato.badge}</Badge> : null}
      </div>
      <div className="flex flex-col justify-between p-6">
        <div>
          <p className="mb-2 font-display text-sm italic text-vino-gold">
            Sugestão da casa
          </p>
          <h3 className="mb-3 font-display text-3xl font-semibold leading-tight text-vino-cream">
            {prato.nome}
          </h3>
          {prato.descricao ? (
            <p className="text-sm font-light leading-relaxed text-vino-muted">{prato.descricao}</p>
          ) : null}
        </div>
        <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_190px] lg:items-end">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            {(prato.tamanhos ?? [{ nome: "A partir de", preco: prato.preco }]).map((tamanho) => (
              <div className="border-t border-vino-border pt-3" key={tamanho.nome}>
                <span className="block text-[0.62rem] uppercase tracking-[0.16em] text-vino-muted">
                  {tamanho.nome}
                </span>
                <span className="price-outline mt-1 block font-display text-2xl font-semibold leading-none text-vino-gold">
                  {formatCurrency(tamanho.preco)}
                </span>
              </div>
            ))}
          </div>
          <button
            aria-label={`Adicionar ${prato.nome}`}
            className="inline-flex min-h-11 items-center justify-center border border-vino-borderHover px-4 py-3 text-center text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-vino-goldDim transition hover:border-vino-gold hover:bg-vino-gold hover:text-[#102f23]"
            type="button"
            onClick={addPrato}
          >
            Adicionar ao carrinho
          </button>
        </div>
        {exibeBorda ? (
          <div className="mt-5 border-t border-vino-border pt-4" onClick={(event) => event.stopPropagation()}>
            <label className="inline-flex items-center gap-3 text-sm font-semibold text-vino-cream">
              <input
                checked={bordaRecheada}
                className="h-4 w-4 accent-vino-gold"
                type="checkbox"
                onChange={(event) => setBordaRecheada(event.target.checked)}
              />
              Borda recheada
              <span className="text-xs font-normal text-vino-muted">+ R$ 12 broto | + R$ 18 grande</span>
            </label>
            {bordaRecheada ? (
              <label className="mt-3 block text-xs uppercase tracking-[0.14em] text-vino-muted">
                Sabor da borda
                <select
                  className="mt-2 w-full max-w-sm border border-vino-border bg-vino-surface px-3 py-3 text-sm normal-case tracking-normal text-vino-cream outline-none transition focus:border-vino-borderHover"
                  value={saborBorda}
                  onChange={(event) => setSaborBorda(event.target.value)}
                >
                  {saboresBordaRecheada.map((sabor) => (
                    <option key={sabor} value={sabor}>
                      {sabor}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
