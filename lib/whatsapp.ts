import { formatCurrency, formatTime } from "@/lib/formatters";
import { formatPedidoNumero } from "@/lib/pedido-counter";
import type { PedidoSimulado } from "@/types";

export function formatarMensagemPedidoSimulado(pedido: PedidoSimulado) {
  const itens = pedido.itens
    .map(
      (item) =>
        `- ${item.quantidade}x ${item.prato.nome} (${formatCurrency(
          item.prato.preco * item.quantidade
        )})`
    )
    .join("\n");

  return [
    "*PEDIDO DE PIZZA - GIARDINO TRATTORIA*",
    "",
    `*Restaurante:* ${pedido.restauranteNome}`,
    `*Pedido:* #${formatPedidoNumero(pedido.numero)}`,
    `*Horario:* ${formatTime(new Date(pedido.criadoEm))}`,
    "",
    "*Cliente (teste):*",
    `Nome: ${pedido.cliente.nome}`,
    `Tel: ${pedido.cliente.telefone}`,
    pedido.cliente.observacoes ? `Observações: ${pedido.cliente.observacoes}` : "",
    "",
    "*Itens:*",
    itens,
    "",
    "*Retirada:* No local",
    `*Total:* ${formatCurrency(pedido.total)}`
  ].join("\n");
}

export async function enviarPedidoGrupoAllIn(pedido: PedidoSimulado) {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  const grupoId = process.env.WHATSAPP_GRUPO_ALLIN_ID;

  if (!apiUrl || !apiKey || !instance || !grupoId) {
    console.warn("[Pedido] WhatsApp nao configurado. Pedido confirmado sem envio.");
    return;
  }

  const baseUrl = apiUrl.startsWith("http") ? apiUrl : `https://${apiUrl}`;

  const response = await fetch(`${baseUrl}/message/sendText/${instance}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey
    },
    body: JSON.stringify({ number: grupoId, text: formatarMensagemPedidoSimulado(pedido) })
  });

  if (!response.ok) {
    throw new Error(`Falha Evolution API: ${response.status}`);
  }
}
