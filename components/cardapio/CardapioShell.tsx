"use client";

import { useEffect, useMemo, useState } from "react";
import { Carrinho } from "@/components/cardapio/Carrinho";
import { CategoriaNav } from "@/components/cardapio/CategoriaNav";
import { Header } from "@/components/cardapio/Header";
import { HeroBanner } from "@/components/cardapio/HeroBanner";
import { MaisPedidosCarousel } from "@/components/cardapio/MaisPedidosCarousel";
import { PratoModal } from "@/components/cardapio/PratoModal";
import { SecaoCategoria } from "@/components/cardapio/SecaoCategoria";
import { Toast } from "@/components/ui/Toast";
import { useCarrinho } from "@/hooks/useCarrinho";
import { formatCurrency } from "@/lib/formatters";
import { formatPedidoNumero } from "@/lib/pedido-format";
import type { Prato, Restaurante } from "@/types";

export function CardapioShell({ restaurante }: { restaurante: Restaurante }) {
  const [activeCategory, setActiveCategory] = useState(restaurante.categorias[0]?.id ?? "");
  const [selectedPrato, setSelectedPrato] = useState<Prato | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState<number | null>(null);
  const adicionarItem = useCarrinho((state) => state.adicionarItem);
  const totalCarrinho = useCarrinho((state) => state.total());
  const quantidadeCarrinho = useCarrinho((state) => state.quantidadeTotal());
  const hasCartItems = quantidadeCarrinho > 0;

  const pratosPorCategoria = useMemo(
    () =>
      restaurante.categorias.map((categoria) => ({
        categoria,
        pratos: restaurante.pratos.filter(
          (prato) => prato.categoriaId === categoria.id && prato.disponivel
        )
      })),
    [restaurante]
  );

  const maisPedidos = useMemo(
    () =>
      restaurante.pratos.filter(
        (prato) => prato.disponivel && (prato.destaque || prato.badge === "Mais Pedido")
      ),
    [restaurante.pratos]
  );

  useEffect(() => {
    const sections = restaurante.categorias
      .map((categoria) => document.getElementById(`sec-${categoria.id}`))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveCategory(visible.target.id.replace("sec-", ""));
        }
      },
      { rootMargin: "-150px 0px -55% 0px", threshold: [0.15, 0.3, 0.6] }
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [restaurante.categorias]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(message: string) {
    setToast(message);
  }

  function addPrato(prato: Prato, quantidade = 1) {
    adicionarItem(restaurante.id, prato, quantidade);
    setConfirmationNumber(null);
    showToast(`${prato.nome} adicionado`);
  }

  function scrollToCategory(categoryId: string) {
    setActiveCategory(categoryId);
    document.getElementById(`sec-${categoryId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  return (
    <div className="min-h-screen text-vino-cream">
      <Header restaurante={restaurante} onCartOpen={() => setCartOpen(true)} />
      <HeroBanner restaurante={restaurante} />
      <CategoriaNav
        activeCategory={activeCategory}
        categorias={restaurante.categorias}
        onSelect={scrollToCategory}
      />
      <main className={`${hasCartItems ? "pb-32" : "pb-10"}`}>
        <MaisPedidosCarousel pratos={maisPedidos} onAdd={addPrato} onOpen={setSelectedPrato} />
        <div className="mx-auto max-w-[1100px] px-4 pt-8 md:px-8">
          {pratosPorCategoria.map(({ categoria, pratos }) => (
            <SecaoCategoria
              categoria={categoria}
              key={categoria.id}
              pratos={pratos}
              onAdd={addPrato}
              onOpen={setSelectedPrato}
            />
          ))}
        </div>
      </main>
      {hasCartItems && !cartOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-[120] border-t border-vino-borderHover bg-vino-surface/94 px-4 py-3 shadow-[0_-18px_60px_rgba(65,46,20,0.14)] backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4">
            <button
              className="min-w-0 flex-1 text-left"
              type="button"
              onClick={() => setCartOpen(true)}
            >
              <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-vino-muted">
                Carrinho
              </span>
              <span className="price-outline mt-1 block font-display text-2xl leading-none text-vino-gold">
                {formatCurrency(totalCarrinho)}
              </span>
            </button>
            <button
              className="shrink-0 bg-vino-gold px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] text-[#102f23] transition hover:bg-vino-goldLight sm:px-8"
              type="button"
              onClick={() => setCartOpen(true)}
            >
              Fazer pedido
            </button>
          </div>
        </div>
      ) : null}
      <PratoModal prato={selectedPrato} onAdd={addPrato} onClose={() => setSelectedPrato(null)} />
      <Carrinho
        confirmationNumber={confirmationNumber}
        open={cartOpen}
        restaurante={restaurante}
        onClose={() => setCartOpen(false)}
        onConfirmed={(numero) => {
          setConfirmationNumber(numero);
          showToast(`Pedido #${formatPedidoNumero(numero)} confirmado`);
        }}
        onResetConfirmation={() => setConfirmationNumber(null)}
      />
      <Toast message={toast ? `OK - ${toast}` : ""} visible={Boolean(toast)} />
    </div>
  );
}
