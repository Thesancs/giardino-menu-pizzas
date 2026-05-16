import Image from "next/image";

import logoImage from "@/assets/Giardino-Logo.jpg";
import type { Restaurante } from "@/types";

export function HeroBanner({ restaurante }: { restaurante: Restaurante }) {
  return (
    <section className="relative overflow-hidden border-b border-vino-border">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(214,163,58,0.24),transparent_32%),radial-gradient(circle_at_86%_20%,rgba(18,59,43,0.1),transparent_30%),linear-gradient(135deg,rgba(255,250,240,0.96)_0%,rgba(247,240,223,0.98)_58%,rgba(239,226,200,0.96)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-vino-gold/80 to-transparent" />
      <div className="relative mx-auto grid min-h-[420px] w-full max-w-[1100px] items-end gap-8 px-4 pb-10 pt-14 md:grid-cols-[1fr_280px] md:px-8 md:pt-20">
        <div>
          <p className="mb-4 inline-flex border-y border-vino-gold/55 py-2 text-[0.68rem] uppercase tracking-[0.36em] text-vino-goldDim">
            Cardápio de pizzas
          </p>
          <h1 className="max-w-3xl font-display text-5xl font-light leading-none text-vino-cream sm:text-7xl">
            {restaurante.nome}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-vino-muted">
            Pizzas artesanais em dois tamanhos, preparadas para compartilhar à mesa.
          </p>
          <div className="mt-6 max-w-2xl border-2 border-vino-gold bg-vino-gold/16 p-4 shadow-[0_16px_44px_rgba(214,163,58,0.16)]">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-vino-goldDim">
              Borda recheada opcional
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-vino-cream">
              Catupiry, cream cheese, gorgonzola ou mussarela de búfala.
            </p>
            <p className="mt-1 text-sm leading-6 text-vino-muted">
              Acréscimo: R$ 12 no broto | R$ 18 na grande.
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-xs tracking-[0.08em] text-vino-muted">
            <span>{restaurante.endereco}</span>
            <span>Broto 25cm e Grande 35cm</span>
            <span>Telefone: (19) 3933-1004</span>
          </div>
          <a
            className="mt-7 inline-flex border border-vino-gold bg-vino-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#102f23] shadow-[0_14px_34px_rgba(214,163,58,0.2)] transition hover:bg-vino-goldLight"
            href="https://giardinotrattoria01.menudino.com/"
            rel="noreferrer"
            target="_blank"
          >
            Ir para o cardápio principal
          </a>
        </div>
        <div className="relative hidden aspect-square overflow-hidden rounded-full border border-vino-gold/70 bg-vino-surface shadow-vino md:block">
          <Image
            src={logoImage}
            alt={`Logo ${restaurante.nome}`}
            fill
            priority
            sizes="260px"
            className="object-cover"
          />
        </div>
      </div>
      <div className="relative mx-auto max-w-[1100px] px-4 pb-6 md:px-8">
        <div className="grid gap-3 border-t border-vino-border pt-5 text-[0.72rem] uppercase tracking-[0.14em] text-vino-muted md:grid-cols-2">
          <p>Sábado: 12h às 00h | Domingo: 12h às 22h</p>
          <p>Quarta e quinta: 12h às 23h | Sexta: 12h às 00h</p>
          <p className="md:col-span-2">Segunda-feira e terça-feira: fechado</p>
        </div>
      </div>
    </section>
  );
}
