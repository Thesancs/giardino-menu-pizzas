import type { Prato, Restaurante } from "@/types";

const bordaRecheada =
  "Borda recheada opcional: Catupiry, cream cheese, gorgonzola ou mussarela de búfala. + R$ 12 no broto | + R$ 18 na grande";

function pizza({
  id,
  categoriaId,
  nome,
  descricao,
  broto,
  grande,
  badge,
  destaque
}: {
  id: string;
  categoriaId: string;
  nome: string;
  descricao: string;
  broto: number;
  grande: number;
  badge?: string;
  destaque?: boolean;
}): Prato {
  return {
    id,
    categoriaId,
    nome,
    descricao,
    ingredientes: descricao,
    preco: broto,
    tamanhos: [
      { nome: "Broto 25cm", preco: broto },
      { nome: "Grande 35cm", preco: grande }
    ],
    observacao: bordaRecheada,
    badge,
    destaque,
    disponivel: true
  };
}

function itemCardapio({
  id,
  categoriaId,
  nome,
  preco
}: {
  id: string;
  categoriaId: string;
  nome: string;
  preco: number;
}): Prato {
  return {
    id,
    categoriaId,
    nome,
    descricao: "",
    ingredientes: nome,
    preco,
    tamanhos: [{ nome: "Unidade", preco }],
    disponivel: true
  };
}

export const demoRestaurante: Restaurante = {
  id: "giardino-trattoria",
  slug: "giardino-trattoria",
  nome: "Giardino Trattoria",
  subtitulo: "Cardápio de Pizzas",
  descricao: "Pizzas artesanais em duas medidas, preparadas para compartilhar à mesa.",
  horario: "Quarta e quinta: 12h às 23h | Sexta e sábado: 12h à 0h | Domingo: 12h às 22h",
  endereco: "Rua Neusa Aparecida Pereira Caron, 154 - Jardim Vista Alegre, Paulínia - SP, 13140-164",
  whatsapp: "551939331004",
  pedidoMinimo: 0,
  taxaEntrega: 0,
  deliveryAtivo: false,
  categorias: [
    { id: "pizzas-salgadas", nome: "Pizzas Salgadas", ordem: 1 },
    { id: "pizza-doce", nome: "Pizza Doce", ordem: 2 },
    { id: "bebidas", nome: "Bebidas", ordem: 3 },
    { id: "cervejas", nome: "Cervejas", ordem: 4 }
  ],
  pratos: [
    pizza({
      id: "margherita",
      categoriaId: "pizzas-salgadas",
      nome: "Margherita",
      descricao: "Molho de tomate, mozzarela de búfala, manjericão fresco e azeite extra virgem.",
      broto: 59,
      grande: 89,
      badge: "Clássica",
      destaque: true
    }),
    pizza({
      id: "tre-c",
      categoriaId: "pizzas-salgadas",
      nome: "Tre C",
      descricao: "Molho de tomate, calabresa defumada, catupiry, cebola, orégano e azeite extra virgem.",
      broto: 69,
      grande: 99,
      badge: "Mais pedida"
    }),
    pizza({
      id: "parisiense",
      categoriaId: "pizzas-salgadas",
      nome: "Parisiense",
      descricao: "Tiras de frango, presunto cozido, ervilha, creme branco e parmesão.",
      broto: 69,
      grande: 99
    }),
    pizza({
      id: "quattro-formaggio",
      categoriaId: "pizzas-salgadas",
      nome: "Quattro Formaggio",
      descricao: "Azeite extra virgem, mussarela, parmesão, gorgonzola e catupiry.",
      broto: 72,
      grande: 109,
      badge: "Queijos",
      destaque: true
    }),
    pizza({
      id: "capricciosa",
      categoriaId: "pizzas-salgadas",
      nome: "Capricciosa",
      descricao: "Molho de tomate, mussarela, presunto cozido, cogumelo paris, alcachofra e azeitonas.",
      broto: 72,
      grande: 109
    }),
    pizza({
      id: "pepperoni",
      categoriaId: "pizzas-salgadas",
      nome: "Pepperoni",
      descricao: "Molho de tomate, mussarela, pepperoni e azeite extra virgem.",
      broto: 72,
      grande: 109
    }),
    pizza({
      id: "porchetta",
      categoriaId: "pizzas-salgadas",
      nome: "Porchetta",
      descricao: "Molho de tomate, porchetta suína pré-defumada, escarola, alho e azeite extra virgem.",
      broto: 72,
      grande: 109
    }),
    pizza({
      id: "quattro-stagioni",
      categoriaId: "pizzas-salgadas",
      nome: "Quattro Stagioni",
      descricao: "Molho de tomate, presunto parma, cogumelo paris, alcachofras e azeitonas.",
      broto: 89,
      grande: 119,
      badge: "Especial"
    }),
    pizza({
      id: "marinara",
      categoriaId: "pizzas-salgadas",
      nome: "Marinara",
      descricao: "Molho de tomate, alho, camarão, orégano e azeite extra virgem.",
      broto: 82,
      grande: 119
    }),
    pizza({
      id: "verano",
      categoriaId: "pizzas-salgadas",
      nome: "Verano",
      descricao: "Molho de tomate, alho, abobrinha, rúcula, camarão e azeite extra virgem.",
      broto: 86,
      grande: 126
    }),
    pizza({
      id: "georgia",
      categoriaId: "pizzas-salgadas",
      nome: "Georgia",
      descricao: "Creme de catupiry, camarão e parmesão.",
      broto: 99,
      grande: 139,
      badge: "Premium",
      destaque: true
    }),
    pizza({
      id: "flamboyant",
      categoriaId: "pizzas-salgadas",
      nome: "Flamboyant",
      descricao: "Molho de tomate, mussarela, tiras de mignon, banana e catupiry.",
      broto: 89,
      grande: 119
    }),
    pizza({
      id: "capra-e-aglio-nero",
      categoriaId: "pizzas-salgadas",
      nome: "Capra e Aglio Nero",
      descricao: "Molho de tomate, queijo de cabra, alho negro e azeite extra virgem.",
      broto: 89,
      grande: 119,
      badge: "Autoral"
    }),
    pizza({
      id: "romeu-e-julieta",
      categoriaId: "pizza-doce",
      nome: "Romeu e Julieta",
      descricao: "Goiabada cascão, cream cheese e parmesão.",
      broto: 59,
      grande: 89,
      badge: "Doce",
      destaque: true
    }),
    itemCardapio({
      id: "agua-panna",
      categoriaId: "bebidas",
      nome: "Água Panna",
      preco: 39
    }),
    itemCardapio({
      id: "agua-prata-com-gas",
      categoriaId: "bebidas",
      nome: "Água Prata com Gás",
      preco: 9
    }),
    itemCardapio({
      id: "agua-prata-sem-gas",
      categoriaId: "bebidas",
      nome: "Água Prata sem Gás",
      preco: 9
    }),
    itemCardapio({
      id: "agua-san-pellegrino",
      categoriaId: "bebidas",
      nome: "Água San Pellegrino",
      preco: 39
    }),
    itemCardapio({
      id: "coca-cola-tradicional-250ml",
      categoriaId: "bebidas",
      nome: "Coca-Cola Tradicional 250ml",
      preco: 11
    }),
    itemCardapio({
      id: "coca-cola-zero-250ml",
      categoriaId: "bebidas",
      nome: "Coca-Cola Zero 250ml",
      preco: 11
    }),
    itemCardapio({
      id: "guarana-antarctica-lata-350ml",
      categoriaId: "bebidas",
      nome: "Guaraná Antarctica - Lata 350ml",
      preco: 11
    }),
    itemCardapio({
      id: "guarana-antarctica-zero-lata-350ml",
      categoriaId: "bebidas",
      nome: "Guaraná Antarctica Zero - Lata 350ml",
      preco: 11
    }),
    itemCardapio({
      id: "h2o-limoneto-500ml",
      categoriaId: "bebidas",
      nome: "H2O Limoneto - 500ml",
      preco: 11
    }),
    itemCardapio({
      id: "red-bull",
      categoriaId: "bebidas",
      nome: "Red Bull",
      preco: 26
    }),
    itemCardapio({
      id: "schweppes-citrus-lata-350ml",
      categoriaId: "bebidas",
      nome: "Schweppes Citrus - Lata 350ml",
      preco: 11
    }),
    itemCardapio({
      id: "tonica-250ml",
      categoriaId: "bebidas",
      nome: "Tônica 250ml",
      preco: 11
    }),
    itemCardapio({
      id: "tonica-zero-lata-350ml",
      categoriaId: "bebidas",
      nome: "Tônica Zero - Lata 350ml",
      preco: 11
    }),
    itemCardapio({
      id: "antarctica-original-600ml",
      categoriaId: "cervejas",
      nome: "Antarctica Original 600ml",
      preco: 26
    }),
    itemCardapio({
      id: "cerpa-export-long-neck",
      categoriaId: "cervejas",
      nome: "Cerpa Export Long Neck",
      preco: 22
    }),
    itemCardapio({
      id: "heineken-long-neck",
      categoriaId: "cervejas",
      nome: "Heineken Long Neck",
      preco: 16
    }),
    itemCardapio({
      id: "heineken-long-neck-zero",
      categoriaId: "cervejas",
      nome: "Heineken Long Neck Zero",
      preco: 16
    }),
    itemCardapio({
      id: "paulaner",
      categoriaId: "cervejas",
      nome: "Paulaner",
      preco: 39
    })
  ]
};
