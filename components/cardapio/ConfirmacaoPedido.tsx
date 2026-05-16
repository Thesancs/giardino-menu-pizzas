"use client";

import { Button } from "@/components/ui/Button";
import { formatPedidoNumero } from "@/lib/pedido-format";

interface ConfirmacaoPedidoProps {
  numero: number;
  onNewOrder: () => void;
}

export function ConfirmacaoPedido({ numero, onNewOrder }: ConfirmacaoPedidoProps) {
  return (
    <div className="border border-vino-borderHover bg-vino-card p-6 text-center">
      <p className="text-[0.7rem] uppercase tracking-[0.24em] text-vino-gold">
        Pedido confirmado
      </p>
      <h3 className="mt-3 font-display text-4xl font-semibold text-vino-cream">
        #{formatPedidoNumero(numero)}
      </h3>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-vino-muted">
        Seu pedido foi registrado para retirada. Confira os itens e a opção de borda antes de
        finalizar diretamente com o restaurante.
      </p>
      <Button className="mt-6" type="button" variant="outline" onClick={onNewOrder}>
        Novo pedido
      </Button>
    </div>
  );
}
