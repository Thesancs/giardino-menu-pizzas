import { NextResponse } from "next/server";
import { demoRestaurante } from "@/data/demo-restaurante";
import { aplicarBordaRecheada, saboresBordaRecheada } from "@/lib/borda-recheada";
import { getNextPedidoNumero } from "@/lib/pedido-counter";
import { enviarPedidoGrupoAllIn } from "@/lib/whatsapp";
import { onlyDigits } from "@/lib/validators";
import type { ClienteCheckout, ItemCarrinho, PedidoSimulado, PedidoSimuladoPayload, Prato } from "@/types";

const MAX_ITEMS = 30;
const MAX_QUANTITY_PER_ITEM = 20;
const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function addOrigin(origins: Set<string>, value?: string) {
  if (!value) return;

  try {
    origins.add(new URL(value.startsWith("http") ? value : `https://${value}`).origin);
  } catch {
    console.warn("[Pedido] Origem configurada invalida");
  }
}

function isPedidoPayload(value: unknown): value is PedidoSimuladoPayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as PedidoSimuladoPayload;
  return (
    typeof payload.restauranteId === "string" &&
    typeof payload.cliente?.nome === "string" &&
    typeof payload.cliente?.telefone === "string" &&
    Array.isArray(payload.itens) &&
    payload.itens.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.pratoId === "string" &&
        typeof item.quantidade === "number"
    )
  );
}

function jsonResponse(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function jsonError(message: string, status: number) {
  return jsonResponse({ error: message }, status);
}

function getAllowedOrigins(req: Request) {
  const origins = new Set<string>();

  addOrigin(origins, process.env.NEXT_PUBLIC_APP_URL);
  addOrigin(origins, process.env.VERCEL_URL);

  if (process.env.NODE_ENV !== "production") {
    origins.add(new URL(req.url).origin);
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return origins;
}

function isAllowedOrigin(req: Request) {
  const origin = req.headers.get("origin");

  if (!origin) return process.env.NODE_ENV !== "production";

  try {
    return getAllowedOrigins(req).has(new URL(origin).origin);
  } catch {
    return false;
  }
}

function isJsonRequest(req: Request) {
  const contentType = req.headers.get("content-type");
  return Boolean(contentType?.toLowerCase().startsWith("application/json"));
}

function getClientKey(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || req.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(req: Request) {
  const now = Date.now();
  const key = getClientKey(req);
  const current = rateLimitStore.get(key);

  for (const [storedKey, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(storedKey);
    }
  }

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function sanitizeText(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function sanitizeCliente(cliente: ClienteCheckout): ClienteCheckout | null {
  const nome = sanitizeText(cliente.nome, 80);
  const telefoneDigits = onlyDigits(cliente.telefone);
  const observacoes = cliente.observacoes ? sanitizeText(cliente.observacoes, 300) : undefined;

  if (!nome || (telefoneDigits.length !== 10 && telefoneDigits.length !== 11)) {
    return null;
  }

  return {
    nome,
    telefone: telefoneDigits,
    tipoEntrega: "retirada",
    observacoes
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolvePratoFromServer(pratoId: string): Prato | null {
  const directPrato = demoRestaurante.pratos.find((prato) => prato.id === pratoId && prato.disponivel);
  if (directPrato) return directPrato;

  const bordaMatch = pratoId.match(/^(.+)-borda-(.+)$/);
  if (!bordaMatch) return null;

  const [, basePratoId, saborSlug] = bordaMatch;
  const basePrato = demoRestaurante.pratos.find((prato) => prato.id === basePratoId && prato.disponivel);
  const sabor = saboresBordaRecheada.find((item) => slugify(item) === slugify(saborSlug));

  if (!basePrato || !sabor) return null;

  return aplicarBordaRecheada(basePrato, sabor);
}

function buildSafeItems(payload: PedidoSimuladoPayload): ItemCarrinho[] | null {
  if (payload.itens.length === 0 || payload.itens.length > MAX_ITEMS) return null;

  const items: ItemCarrinho[] = [];

  for (const item of payload.itens) {
    if (
      !Number.isInteger(item.quantidade) ||
      item.quantidade < 1 ||
      item.quantidade > MAX_QUANTITY_PER_ITEM
    ) {
      return null;
    }

    const prato = resolvePratoFromServer(sanitizeText(item.pratoId, 120));
    if (!prato) return null;

    items.push({ prato, quantidade: item.quantidade });
  }

  return items;
}

export async function POST(req: Request) {
  let body: unknown;

  if (!isJsonRequest(req)) {
    console.warn("[Pedido] Content-Type bloqueado");
    return jsonError("Content-Type inválido", 415);
  }

  if (!isAllowedOrigin(req)) {
    console.warn("[Pedido] Origem bloqueada");
    return jsonError("Origem não autorizada", 403);
  }

  if (isRateLimited(req)) {
    console.warn("[Pedido] Limite de tentativas excedido");
    return jsonError("Muitas tentativas. Aguarde um instante.", 429);
  }

  try {
    const rawBody = await req.text();

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      console.warn("[Pedido] Payload excede limite");
      return jsonError("Pedido muito grande", 413);
    }

    if (!rawBody.trim()) {
      console.error("[Pedido] Payload vazio");
      return jsonError("Pedido sem dados", 400);
    }

    body = JSON.parse(rawBody);
  } catch (error) {
    console.error("[Pedido] JSON invalido:", error);
    return jsonError("Payload inválido", 400);
  }

  if (!isPedidoPayload(body)) {
    console.error("[Pedido] Payload fora do formato esperado");
    return jsonError("Dados do pedido inválidos", 400);
  }

  if (!body.cliente?.nome || !body.cliente?.telefone || !body.itens?.length) {
    console.error("[Pedido] Dados incompletos");
    return jsonError("Dados incompletos", 400);
  }

  if (body.restauranteId !== demoRestaurante.id) {
    console.error("[Pedido] Restaurante invalido");
    return jsonError("Restaurante inválido", 400);
  }

  const cliente = sanitizeCliente(body.cliente);

  if (!cliente) {
    console.error("[Pedido] Cliente invalido");
    return jsonError("Dados do cliente inválidos", 400);
  }

  const itens = buildSafeItems(body);

  if (!itens) {
    console.error("[Pedido] Itens invalidos");
    return jsonError("Itens do pedido inválidos", 400);
  }

  try {
    const total = itens.reduce((sum, item) => sum + item.prato.preco * item.quantidade, 0);
    const numero = await getNextPedidoNumero();
    const pedido: PedidoSimulado = {
      numero,
      restauranteId: demoRestaurante.id,
      restauranteNome: demoRestaurante.nome,
      cliente,
      itens,
      total,
      pagamentoStatus: "simulado",
      criadoEm: new Date().toISOString()
    };

    try {
      await enviarPedidoGrupoAllIn(pedido);
    } catch {
      console.error("[Pedido] Falha ao enviar para grupo All In");
    }

    return jsonResponse({ sucesso: true, numero });
  } catch (error) {
    console.error("[Pedido] Erro interno ao confirmar pedido:", error instanceof Error ? error.message : error);
    return jsonError("Não foi possível confirmar o pedido", 500);
  }
}
