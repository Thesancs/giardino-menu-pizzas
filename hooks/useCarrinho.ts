"use client";

import { create } from "zustand";
import {
  addItemToCart,
  getCartQuantity,
  getCartTotal,
  removeItemFromCart,
  updateCartItemPrato,
  updateItemQuantity
} from "@/lib/cart";
import type { ItemCarrinho, Prato } from "@/types";

interface CarrinhoState {
  itens: ItemCarrinho[];
  restauranteId: string | null;
  adicionarItem: (restauranteId: string, prato: Prato, quantidade?: number) => void;
  atualizarItemPrato: (pratoId: string, prato: Prato) => void;
  removerItem: (pratoId: string) => void;
  alterarQuantidade: (pratoId: string, quantidade: number) => void;
  limpar: () => void;
  total: () => number;
  quantidadeTotal: () => number;
}

export const useCarrinho = create<CarrinhoState>((set, get) => ({
  itens: [],
  restauranteId: null,
  adicionarItem: (restauranteId, prato, quantidade = 1) => {
    const currentRestaurante = get().restauranteId;

    if (currentRestaurante && currentRestaurante !== restauranteId) {
      set({
        itens: [{ prato, quantidade: Math.max(1, quantidade) }],
        restauranteId
      });
      return;
    }

    set((state) => ({
      itens: addItemToCart(state.itens, prato, quantidade),
      restauranteId
    }));
  },
  atualizarItemPrato: (pratoId, prato) => {
    set((state) => ({ itens: updateCartItemPrato(state.itens, pratoId, prato) }));
  },
  removerItem: (pratoId) => {
    set((state) => ({ itens: removeItemFromCart(state.itens, pratoId) }));
  },
  alterarQuantidade: (pratoId, quantidade) => {
    set((state) => ({ itens: updateItemQuantity(state.itens, pratoId, quantidade) }));
  },
  limpar: () => set({ itens: [], restauranteId: null }),
  total: () => getCartTotal(get().itens),
  quantidadeTotal: () => getCartQuantity(get().itens)
}));
