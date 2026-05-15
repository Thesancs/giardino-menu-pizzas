"use client";

import { Button } from "@/components/ui/Button";

interface ConfirmacaoPedidoProps {
  numero: number;
  onNewOrder: () => void;
}

export function ConfirmacaoPedido({ numero, onNewOrder }: ConfirmacaoPedidoProps) {
  return (
    <div className="border border-vino-borderHover bg-vino-card p-6 text-center">
      <p className="text-[0.7rem] uppercase tracking-[0.24em] text-vino-gold">
        Pedido simulado confirmado
      </p>
      <h3 className="mt-3 font-display text-4xl font-semibold text-vino-cream">#{numero}</h3>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-vino-muted">
        Nenhuma cobranca real foi feita. O pedido foi registrado como demo e a equipe All In
        sera notificada se o WhatsApp estiver configurado.
      </p>
      <Button className="mt-6" type="button" variant="outline" onClick={onNewOrder}>
        Novo pedido
      </Button>
    </div>
  );
}
