"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/formatters";
import type { Prato } from "@/types";

interface PratoModalProps {
  prato: Prato | null;
  onClose: () => void;
  onAdd: (prato: Prato, quantidade: number) => void;
}

export function PratoModal({ prato, onClose, onAdd }: PratoModalProps) {
  const [quantidade, setQuantidade] = useState(1);

  if (!prato) return null;

  const close = () => {
    setQuantidade(1);
    onClose();
  };

  return (
    <Modal labelledBy="prato-modal-title" open={Boolean(prato)} onClose={close}>
      <div className="max-h-[90vh] w-full max-w-[540px] overflow-y-auto border border-vino-borderHover bg-vino-card shadow-vino">
        <div className="relative grid min-h-[170px] place-items-center border-b border-vino-border bg-[linear-gradient(135deg,rgba(214,163,58,0.16),rgba(255,250,240,0.96))]">
          <div className="grid h-24 w-24 place-items-center rounded-full border border-vino-gold/50 bg-vino-surface font-display text-5xl italic text-vino-gold">
            G
          </div>
          <button
            aria-label="Fechar"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center border border-vino-border bg-vino-surface/80 text-vino-cream transition hover:bg-vino-hover"
            type="button"
            onClick={close}
          >
            x
          </button>
        </div>
        <div className="p-6">
          {prato.badge ? <Badge>{prato.badge}</Badge> : null}
          <h2
            className="mt-3 font-display text-4xl font-semibold leading-tight text-vino-cream"
            id="prato-modal-title"
          >
            {prato.nome}
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-vino-muted">{prato.descricao}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {(prato.tamanhos ?? [{ nome: "A partir de", preco: prato.preco }]).map((tamanho) => (
              <div className="border border-vino-border bg-vino-bg/45 p-4" key={tamanho.nome}>
                <span className="block text-[0.65rem] uppercase tracking-[0.12em] text-vino-muted">
                  {tamanho.nome}
                </span>
                <span className="price-outline mt-1 block font-display text-3xl leading-none text-vino-gold">
                  {formatCurrency(tamanho.preco)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-vino-border pt-4 text-[0.7rem] uppercase tracking-[0.1em] text-vino-goldDim">
            {prato.observacao ?? prato.ingredientes}
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Button
              aria-label="Diminuir quantidade"
              className="h-10 w-10 p-0 text-base"
              disabled={quantidade === 1}
              type="button"
              variant="outline"
              onClick={() => setQuantidade((value) => Math.max(1, value - 1))}
            >
              -
            </Button>
            <span className="w-8 text-center font-display text-2xl text-vino-cream">{quantidade}</span>
            <Button
              aria-label="Aumentar quantidade"
              className="h-10 w-10 p-0 text-base"
              type="button"
              variant="outline"
              onClick={() => setQuantidade((value) => value + 1)}
            >
              +
            </Button>
            <span className="price-outline ml-auto font-display text-3xl text-vino-gold">
              {formatCurrency(prato.preco * quantidade)}
            </span>
          </div>
          <Button
            className="mt-6 w-full"
            type="button"
            onClick={() => {
              onAdd(prato, quantidade);
              close();
            }}
          >
            Adicionar ao pedido
          </Button>
        </div>
      </div>
    </Modal>
  );
}
