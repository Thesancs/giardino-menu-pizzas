import Image from "next/image";

import bannerImage from "@/assets/banner.png";
import type { Restaurante } from "@/types";

export function HeroBanner({ restaurante }: { restaurante: Restaurante }) {
  return (
    <section className="relative flex h-[320px] items-end overflow-hidden">
      <Image
        src={bannerImage}
        alt={`Ambiente do ${restaurante.nome}`}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,12,10,0.16)_0%,rgba(14,12,10,0.48)_52%,#0e0c0a_100%)]" />
      <div className="relative mx-auto w-full max-w-[1100px] px-4 pb-8 md:px-8">
        <p className="mb-2 text-[0.65rem] uppercase tracking-[0.3em] text-vino-gold">
          All In Cardapio Demo
        </p>
        <h1 className="font-display text-5xl font-light italic leading-none text-vino-cream sm:text-6xl">
          {restaurante.nome.split(" e ")[0]} <span className="text-vino-gold">e Cucina</span>
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-[0.05em] text-vino-muted">
          <span>{restaurante.horario}</span>
          <span>{restaurante.endereco}</span>
          <span>Retirada no local</span>
        </div>
      </div>
    </section>
  );
}
