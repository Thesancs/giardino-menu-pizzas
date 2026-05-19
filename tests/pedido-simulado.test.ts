import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/pedido-simulado/route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/pedido-simulado", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
}

describe("/api/pedido-simulado", () => {
  it("rejects non-json requests", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const response = await POST(
      new Request("http://localhost/api/pedido-simulado", {
        method: "POST",
        body: JSON.stringify({ cliente: { nome: "Glauber" }, itens: [] })
      })
    );

    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(415);
    expect(body.error).toBe("Content-Type inválido");
    warn.mockRestore();
  });

  it("rejects empty payloads with a clear message", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await POST(jsonRequest(""));

    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(body.error).toBe("Pedido sem dados");
    error.mockRestore();
  });

  it("rejects oversized payloads", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const response = await POST(jsonRequest(" ".repeat(16_385)));

    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(413);
    expect(body.error).toBe("Pedido muito grande");
    warn.mockRestore();
  });

  it("rejects invalid items with a clear message", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await POST(
      jsonRequest({
        restauranteId: "giardino-trattoria",
        restauranteNome: "Giardino Trattoria",
        cliente: { nome: "Glauber", telefone: "(11) 99999-0000", tipoEntrega: "retirada" },
        itens: [{ pratoId: "item-inexistente", nome: "Tagliatelle", preco: 1, quantidade: 1 }]
      })
    );

    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(body.error).toBe("Itens do pedido inválidos");
    error.mockRestore();
  });

  it("rejects tampered restaurant ids", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await POST(
      jsonRequest({
        restauranteId: "outro-restaurante",
        restauranteNome: "Restaurante Falso",
        cliente: { nome: "Glauber", telefone: "(11) 99999-0000", tipoEntrega: "retirada" },
        itens: [{ pratoId: "margherita", nome: "Margherita", preco: 1, quantidade: 1 }]
      })
    );

    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(body.error).toBe("Restaurante inválido");
    error.mockRestore();
  });

  it("rejects incomplete payloads", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await POST(jsonRequest({ cliente: { nome: "" }, itens: [] }));

    expect(response.status).toBe(400);
    error.mockRestore();
  });

  it("confirms valid orders using server-side catalog data", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const response = await POST(
      jsonRequest({
        restauranteId: "giardino-trattoria",
        restauranteNome: "Restaurante adulterado",
        cliente: { nome: "Glauber", telefone: "(11) 99999-0000", tipoEntrega: "retirada" },
        itens: [{ pratoId: "margherita", nome: "Produto adulterado", preco: 1, quantidade: 2 }],
        total: 2
      })
    );

    const body = (await response.json()) as { sucesso: boolean; numero: number };

    expect(response.status).toBe(200);
    expect(body.sucesso).toBe(true);
    expect(body.numero).toBeGreaterThanOrEqual(1);
    warn.mockRestore();
  });
});
