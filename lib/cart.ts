import type { ItemCarrinho, Prato } from "@/types";

export function addItemToCart(items: ItemCarrinho[], prato: Prato, quantidade = 1) {
  const safeQuantity = Math.max(1, quantidade);
  const existing = items.find((item) => item.prato.id === prato.id);

  if (!existing) {
    return [...items, { prato, quantidade: safeQuantity }];
  }

  return items.map((item) =>
    item.prato.id === prato.id
      ? { ...item, quantidade: item.quantidade + safeQuantity }
      : item
  );
}

export function updateItemQuantity(items: ItemCarrinho[], pratoId: string, quantidade: number) {
  if (quantidade < 1) {
    return items.filter((item) => item.prato.id !== pratoId);
  }

  return items.map((item) =>
    item.prato.id === pratoId ? { ...item, quantidade } : item
  );
}

export function updateCartItemPrato(items: ItemCarrinho[], pratoId: string, prato: Prato) {
  return items.map((item) => (item.prato.id === pratoId ? { ...item, prato } : item));
}

export function removeItemFromCart(items: ItemCarrinho[], pratoId: string) {
  return items.filter((item) => item.prato.id !== pratoId);
}

export function getCartTotal(items: ItemCarrinho[]) {
  return items.reduce((total, item) => total + item.prato.preco * item.quantidade, 0);
}

export function getCartQuantity(items: ItemCarrinho[]) {
  return items.reduce((total, item) => total + item.quantidade, 0);
}
