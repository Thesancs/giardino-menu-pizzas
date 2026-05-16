import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/pedido-simulado/route";

describe("/api/pedido-simulado", () => {
  it("rejects incomplete payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/pedido-simulado", {
        method: "POST",
        body: JSON.stringify({ cliente: { nome: "" }, itens: [] })
      })
    );

    expect(response.status).toBe(400);
  });

  it("confirms valid order even when WhatsApp is not configured", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const response = await POST(
      new Request("http://localhost/api/pedido-simulado", {
        method: "POST",
        body: JSON.stringify({
          restauranteId: "vino-e-cucina-demo",
          restauranteNome: "Vino e Cucina",
          cliente: { nome: "Glauber", telefone: "(11) 99999-0000", tipoEntrega: "retirada" },
          itens: [{ pratoId: "tagliatelle", nome: "Tagliatelle", preco: 50, quantidade: 2 }]
        })
      })
    );

    const body = (await response.json()) as { sucesso: boolean; numero: number };

    expect(response.status).toBe(200);
    expect(body.sucesso).toBe(true);
    expect(body.numero).toBeGreaterThanOrEqual(1);
    warn.mockRestore();
  });
});
