import { NextResponse } from "next/server";
import { getNextPedidoNumero } from "@/lib/pedido-counter";
import { enviarPedidoGrupoAllIn } from "@/lib/whatsapp";
import type { ItemCarrinho, PedidoSimulado, PedidoSimuladoPayload } from "@/types";

export async function POST(req: Request) {
  let body: PedidoSimuladoPayload;

  try {
    body = (await req.json()) as PedidoSimuladoPayload;
  } catch (error) {
    console.error("[Pedido] JSON invalido:", error);
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  if (!body.cliente?.nome || !body.cliente?.telefone || !body.itens?.length) {
    console.error("[Pedido] Dados incompletos:", body);
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  try {
    const itens: ItemCarrinho[] = body.itens.map((item) => ({
      prato: {
        id: item.pratoId,
        categoriaId: "snapshot",
        nome: item.nome,
        descricao: "",
        ingredientes: "",
        preco: item.preco,
        fotoUrl: "",
        disponivel: true
      },
      quantidade: item.quantidade
    }));

    const total = itens.reduce((sum, item) => sum + item.prato.preco * item.quantidade, 0);
    const numero = await getNextPedidoNumero();
    const pedido: PedidoSimulado = {
      numero,
      restauranteId: body.restauranteId,
      restauranteNome: body.restauranteNome,
      cliente: body.cliente,
      itens,
      total,
      pagamentoStatus: "simulado",
      criadoEm: new Date().toISOString()
    };

    try {
      await enviarPedidoGrupoAllIn(pedido);
    } catch (error) {
      console.error("[Pedido] Falha ao enviar para grupo All In:", error);
    }

    return NextResponse.json({ sucesso: true, numero });
  } catch (error) {
    console.error("[Pedido] Erro interno ao confirmar pedido:", error);
    return NextResponse.json({ error: "Não foi possível confirmar o pedido" }, { status: 500 });
  }
}
