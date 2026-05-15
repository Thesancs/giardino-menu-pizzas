"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters";
import type { Prato } from "@/types";

interface MaisPedidosCarouselProps {
  pratos: Prato[];
  onAdd: (prato: Prato) => void;
  onOpen: (prato: Prato) => void;
}

export function MaisPedidosCarousel({ pratos, onAdd, onOpen }: MaisPedidosCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let frame = 0;
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!isDraggingRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        scroller.scrollLeft += delta * 0.035;

        if (scroller.scrollLeft >= scroller.scrollWidth / 2) {
          scroller.scrollLeft = 0;
        }
      }

      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (pratos.length === 0) return null;

  const carouselPratos = [...pratos, ...pratos];

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    setIsDragging(true);
    startXRef.current = event.clientX;
    startScrollLeftRef.current = scroller.scrollLeft;
    scroller.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const movement = event.clientX - startXRef.current;
    if (Math.abs(movement) > 6) {
      hasDraggedRef.current = true;
    }
    scroller.scrollLeft = startScrollLeftRef.current - movement;
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const scroller = scrollerRef.current;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (scroller?.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }

    window.setTimeout(() => {
      hasDraggedRef.current = false;
    }, 0);
  }

  return (
    <section
      aria-labelledby="mais-pedidos-title"
      className="mb-12 overflow-hidden border-y border-vino-border bg-vino-surface/40 py-7"
    >
      <div className="mx-auto max-w-[1100px] px-4 md:px-8">
        <div className="mb-5 flex items-baseline gap-5">
          <h2
            className="font-display text-3xl font-normal italic text-vino-cream"
            id="mais-pedidos-title"
          >
            Mais pedidos
          </h2>
          <div className="h-px flex-1 bg-vino-border" />
          <span className="text-[0.68rem] uppercase tracking-[0.15em] text-vino-muted">
            Principal
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-24 bg-gradient-to-r from-vino-bg to-transparent md:block" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-24 bg-gradient-to-l from-vino-bg to-transparent md:block" />
        <div
          className={`mais-pedidos-scroller no-scrollbar overflow-x-auto px-4 md:px-8 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          ref={scrollerRef}
          onPointerCancel={handlePointerEnd}
          onPointerDown={handlePointerDown}
          onPointerLeave={(event) => {
            if (isDraggingRef.current) handlePointerEnd(event);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
        >
          <div className="flex w-max gap-4 md:gap-5">
          {carouselPratos.map((prato, index) => (
            <article
              className="group grid w-[78vw] max-w-[330px] shrink-0 cursor-pointer select-none grid-cols-[112px_1fr] overflow-hidden border border-vino-border bg-vino-card shadow-vino transition duration-200 hover:-translate-y-0.5 hover:border-vino-borderHover hover:bg-vino-hover focus-within:border-vino-gold sm:w-[360px] sm:grid-cols-[140px_1fr]"
              key={`${prato.id}-${index}`}
              onClick={() => {
                if (hasDraggedRef.current) return;
                onOpen(prato);
              }}
            >
              <div className="relative min-h-[168px] overflow-hidden">
                <img
                  alt={prato.nome}
                  className="h-full w-full select-none object-cover brightness-90 saturate-90 transition duration-300 group-hover:scale-[1.04] group-hover:brightness-100 group-hover:saturate-100"
                  draggable={false}
                  src={prato.fotoUrl}
                />
                <Badge className="absolute left-2 top-2">
                  {prato.badge ?? "Mais pedido"}
                </Badge>
              </div>
              <div className="flex min-w-0 flex-col justify-between p-4">
                <div>
                  <h3 className="line-clamp-2 font-display text-xl font-semibold leading-tight text-vino-cream">
                    {prato.nome}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs font-light leading-relaxed text-vino-muted">
                    {prato.descricao}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="min-w-0 font-display text-2xl font-semibold leading-none text-vino-gold">
                    {formatCurrency(prato.preco)}
                  </span>
                  <button
                    aria-label={`Adicionar ${prato.nome}`}
                    className="grid h-9 w-9 shrink-0 place-items-center border border-vino-borderHover text-2xl leading-none text-vino-gold transition hover:border-vino-gold hover:bg-vino-gold hover:text-vino-bg focus:border-vino-gold focus:bg-vino-gold focus:text-vino-bg focus:outline-none"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onAdd(prato);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
