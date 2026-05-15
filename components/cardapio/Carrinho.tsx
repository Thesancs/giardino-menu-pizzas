"use client";

import { ConfirmacaoPedido } from "@/components/cardapio/ConfirmacaoPedido";
import { CheckoutForm } from "@/components/cardapio/CheckoutForm";
import { Button } from "@/components/ui/Button";
import { useCarrinho } from "@/hooks/useCarrinho";
import { formatCurrency } from "@/lib/formatters";
import type { Restaurante } from "@/types";

interface CarrinhoProps {
  open: boolean;
  restaurante: Restaurante;
  confirmationNumber: number | null;
  onClose: () => void;
  onConfirmed: (numero: number) => void;
  onResetConfirmation: () => void;
}

export function Carrinho({
  open,
  restaurante,
  confirmationNumber,
  onClose,
  onConfirmed,
  onResetConfirmation
}: CarrinhoProps) {
  const itens = useCarrinho((state) => state.itens);
  const alterarQuantidade = useCarrinho((state) => state.alterarQuantidade);
  const removerItem = useCarrinho((state) => state.removerItem);
  const limpar = useCarrinho((state) => state.limpar);
  const total = useCarrinho((state) => state.total());

  return (
    <>
      <div
        className={`fixed inset-0 z-[180] bg-black/60 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        aria-label="Carrinho"
        className={`fixed inset-x-0 bottom-0 z-[190] mx-auto flex max-h-[86vh] w-full max-w-[1100px] flex-col border border-vino-borderHover bg-vino-surface/88 shadow-vino backdrop-blur-2xl backdrop-saturate-150 transition-transform duration-300 before:pointer-events-none before:absolute before:inset-0 before:border before:border-white/5 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03)_35%,rgba(201,165,90,0.08))] before:content-[''] md:max-h-[82vh] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="relative z-10 flex items-center justify-between border-b border-vino-border bg-vino-bg/20 p-5 backdrop-blur-md">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-vino-gold">
              Pedido
            </p>
            <h2 className="font-display text-3xl text-vino-cream">Seu pedido</h2>
          </div>
          <button
            aria-label="Fechar carrinho"
            className="grid h-9 w-9 place-items-center border border-vino-border text-vino-cream"
            type="button"
            onClick={onClose}
          >
            x
          </button>
        </div>
        <div className="relative z-10 flex-1 overflow-y-auto p-5">
          {confirmationNumber ? (
            <ConfirmacaoPedido
              numero={confirmationNumber}
              onNewOrder={() => {
                limpar();
                onResetConfirmation();
              }}
            />
          ) : itens.length === 0 ? (
            <div className="border border-vino-border bg-vino-card/60 p-5 text-sm text-vino-muted backdrop-blur-md">
              Seu pedido ainda esta vazio.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {itens.map((item) => (
                  <div
                    className="border border-vino-border bg-vino-card/64 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-md"
                    key={item.prato.id}
                  >
                    <div className="flex gap-3">
                      <img
                        alt={item.prato.nome}
                        className="h-20 w-20 shrink-0 object-cover"
                        src={item.prato.fotoUrl}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-xl leading-tight text-vino-cream">
                          {item.prato.nome}
                        </h3>
                        <p className="mt-1 text-sm text-vino-gold">
                          {formatCurrency(item.prato.preco * item.quantidade)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          className="h-8 w-8 p-0"
                          type="button"
                          variant="outline"
                          onClick={() => alterarQuantidade(item.prato.id, item.quantidade - 1)}
                        >
                          -
                        </Button>
                        <span className="w-7 text-center text-sm text-vino-cream">
                          {item.quantidade}
                        </span>
                        <Button
                          className="h-8 w-8 p-0"
                          type="button"
                          variant="outline"
                          onClick={() => alterarQuantidade(item.prato.id, item.quantidade + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <button
                        className="text-xs uppercase tracking-[0.12em] text-vino-muted underline-offset-4 hover:text-vino-cream hover:underline"
                        type="button"
                        onClick={() => removerItem(item.prato.id)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-vino-border pt-5">
                <div className="flex justify-between text-sm text-vino-muted">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm text-vino-muted">
                  <span>Retirada</span>
                  <span>No local</span>
                </div>
                <div className="mt-4 flex justify-between font-display text-3xl text-vino-gold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              <CheckoutForm
                itens={itens}
                restaurante={restaurante}
                total={total}
                onConfirmed={onConfirmed}
              />
            </>
          )}
        </div>
      </aside>
    </>
  );
}
