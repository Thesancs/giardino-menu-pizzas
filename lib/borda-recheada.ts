import type { Prato } from "@/types";

export const saboresBordaRecheada = [
  "Catupiry",
  "Cream cheese",
  "Gorgonzola",
  "Mussarela de búfala"
];

export function permiteBordaRecheada(prato: Prato) {
  return Boolean(prato.observacao && prato.tamanhos && prato.tamanhos.length > 1);
}

export function temBordaRecheada(prato: Prato) {
  return Boolean(prato.basePratoId);
}

export function obterSaborBorda(prato: Prato) {
  return prato.nome.split(" - borda recheada de ")[1] ?? saboresBordaRecheada[0];
}

export function removerBordaRecheada(prato: Prato): Prato {
  if (!temBordaRecheada(prato)) return prato;

  return {
    ...prato,
    id: prato.basePratoId ?? prato.id,
    basePratoId: undefined,
    nome: prato.nome.split(" - borda recheada de ")[0],
    preco: prato.precoBase ?? prato.preco - 12,
    precoBase: undefined
  };
}

export function aplicarBordaRecheada(prato: Prato, sabor: string): Prato {
  const pratoBase = removerBordaRecheada(prato);

  return {
    ...pratoBase,
    id: `${pratoBase.id}-borda-${sabor.toLowerCase().replace(/\s+/g, "-")}`,
    basePratoId: pratoBase.id,
    nome: `${pratoBase.nome} - borda recheada de ${sabor}`,
    preco: pratoBase.preco + 12,
    precoBase: pratoBase.preco,
    observacao: `${pratoBase.observacao}. Sabor selecionado: ${sabor}. Valor aplicado no pedido: + R$ 12 no broto. Para pizza grande, confirme o adicional de R$ 18 com o restaurante.`
  };
}
