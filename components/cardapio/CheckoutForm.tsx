"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatPhoneInput, isRequired, isValidBrazilianPhone } from "@/lib/validators";
import type { ClienteCheckout, ItemCarrinho, Restaurante } from "@/types";

interface CheckoutFormProps {
  restaurante: Restaurante;
  itens: ItemCarrinho[];
  total: number;
  onConfirmed: (numero: number) => void;
}

export function CheckoutForm({ restaurante, itens, total, onConfirmed }: CheckoutFormProps) {
  const [cliente, setCliente] = useState<ClienteCheckout>({
    nome: "",
    telefone: "",
    tipoEntrega: "retirada"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isRequired(cliente.nome)) {
      setError("Informe seu nome.");
      return;
    }

    if (!isValidBrazilianPhone(cliente.telefone)) {
      setError("Informe um telefone valido.");
      return;
    }

    if (itens.length === 0) {
      setError("Adicione pelo menos um item ao pedido.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      const endpoint =
        process.env.NEXT_PUBLIC_PAGAMENTO_REAL === "true"
          ? "/api/pagamento/criar"
          : "/api/pedido-simulado";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restauranteId: restaurante.id,
          restauranteNome: restaurante.nome,
          cliente,
          itens: itens.map((item) => ({
            pratoId: item.prato.id,
            nome: item.prato.nome,
            preco: item.prato.preco,
            quantidade: item.quantidade
          })),
          total
        })
      });

      const result = (await response.json()) as { sucesso?: boolean; numero?: number; error?: string };

      if (!response.ok || !result.sucesso || !result.numero) {
        throw new Error(result.error || "Nao foi possivel confirmar o pedido.");
      }

      onConfirmed(result.numero);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nao foi possivel confirmar o pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-5 border-t border-vino-border pt-5" onSubmit={submit}>
      <h3 className="font-display text-2xl text-vino-cream">Dados para retirada</h3>
      <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-vino-muted">
        Nome
        <input
          className="mt-2 w-full border border-vino-border bg-vino-bg px-3 py-3 text-sm normal-case tracking-normal text-vino-cream outline-none transition focus:border-vino-borderHover"
          value={cliente.nome}
          onChange={(event) => setCliente((value) => ({ ...value, nome: event.target.value }))}
        />
      </label>
      <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-vino-muted">
        Telefone
        <input
          className="mt-2 w-full border border-vino-border bg-vino-bg px-3 py-3 text-sm normal-case tracking-normal text-vino-cream outline-none transition focus:border-vino-borderHover"
          inputMode="tel"
          value={cliente.telefone}
          onChange={(event) =>
            setCliente((value) => ({ ...value, telefone: formatPhoneInput(event.target.value) }))
          }
        />
      </label>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <Button className="mt-5 w-full" disabled={loading} type="submit">
        {loading ? "Processando demo..." : "Confirmar pedido"}
      </Button>
    </form>
  );
}
