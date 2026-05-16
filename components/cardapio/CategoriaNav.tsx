"use client";

import type { Categoria } from "@/types";

interface CategoriaNavProps {
  categorias: Categoria[];
  activeCategory: string;
  onSelect: (categoryId: string) => void;
}

export function CategoriaNav({ categorias, activeCategory, onSelect }: CategoriaNavProps) {
  return (
    <nav className="sticky top-[70px] z-[90] border-b border-vino-border bg-vino-surface/86 backdrop-blur-xl">
      <div className="no-scrollbar mx-auto flex max-w-[1100px] overflow-x-auto px-4 md:px-8">
        {categorias.map((categoria) => (
          <button
            key={categoria.id}
            className={`shrink-0 border-b px-5 py-4 text-xs uppercase tracking-[0.18em] transition ${
              activeCategory === categoria.id
                ? "border-vino-gold text-vino-gold"
                : "border-transparent text-vino-muted hover:text-vino-cream"
            }`}
            type="button"
            onClick={() => onSelect(categoria.id)}
          >
            {categoria.nome}
          </button>
        ))}
      </div>
    </nav>
  );
}
