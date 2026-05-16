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

interface PratoCardProps {
  prato: Prato;
  onAdd: (prato: Prato) => void;
  onOpen: (prato: Prato) => void;
}

export function PratoCard({ prato, onAdd, onOpen }: PratoCardProps) {
  const [bordaRecheada, setBordaRecheada] = useState(false);
  const [saborBorda, setSaborBorda] = useState(saboresBordaRecheada[0]);
  const exibeBorda = permiteBordaRecheada(prato);

  function addPrato(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onAdd(bordaRecheada ? aplicarBordaRecheada(prato, saborBorda) : prato);
  }

  return (
    <article
      className="group relative cursor-pointer border border-vino-border bg-vino-card/72 p-5 shadow-[0_14px_38px_rgba(65,46,20,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-vino-borderHover hover:bg-vino-card"
      onClick={() => onOpen(prato)}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_250px_190px] lg:items-center">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-2xl font-semibold leading-tight text-vino-cream">
              {prato.nome}
            </h3>
            {prato.badge ? <Badge>{prato.badge}</Badge> : null}
          </div>
          {prato.descricao ? (
            <p className="max-w-2xl text-sm font-light leading-7 text-vino-muted">
              {prato.descricao}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(prato.tamanhos ?? [{ nome: "A partir de", preco: prato.preco }]).map((tamanho) => (
            <div className="text-left sm:text-right" key={tamanho.nome}>
              <span className="block text-[0.6rem] uppercase tracking-[0.16em] text-vino-muted">
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
    </article>
  );
}
