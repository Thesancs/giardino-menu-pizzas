import { NextResponse } from "next/server";
import { enviarPedidoGrupoAllIn } from "@/lib/whatsapp";
import type { ItemCarrinho, PedidoSimulado, PedidoSimuladoPayload } from "@/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PedidoSimuladoPayload;

    if (!body.cliente?.nome || !body.cliente?.telefone || !body.itens?.length) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

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
    const numero = Math.floor(Math.random() * 900) + 100;
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
      console.error("[Demo] Falha ao enviar para grupo All In:", error);
    }

    return NextResponse.json({ sucesso: true, numero });
  } catch {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }
}
