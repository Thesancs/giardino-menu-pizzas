import { describe, expect, it } from "vitest";
import {
  addItemToCart,
  getCartQuantity,
  getCartTotal,
  removeItemFromCart,
  updateItemQuantity
} from "@/lib/cart";
import type { Prato } from "@/types";

const prato: Prato = {
  id: "tagliatelle",
  categoriaId: "paste",
  nome: "Tagliatelle",
  descricao: "Massa fresca",
  ingredientes: "Massa",
  preco: 50,
  fotoUrl: "",
  disponivel: true
};

describe("cart helpers", () => {
  it("adds a new item and increments quantity for existing item", () => {
    const first = addItemToCart([], prato, 1);
    const second = addItemToCart(first, prato, 2);

    expect(second).toHaveLength(1);
    expect(second[0].quantidade).toBe(3);
  });

  it("updates, removes and totals items", () => {
    const items = updateItemQuantity(addItemToCart([], prato, 1), prato.id, 4);

    expect(getCartQuantity(items)).toBe(4);
    expect(getCartTotal(items)).toBe(200);
    expect(removeItemFromCart(items, prato.id)).toEqual([]);
  });

  it("removes item when quantity is lower than one", () => {
    const items = addItemToCart([], prato, 1);

    expect(updateItemQuantity(items, prato.id, 0)).toEqual([]);
  });
});
