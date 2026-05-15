import bruschetaImage from "@/assets/bruscheta.png";
import type { Restaurante } from "@/types";

export const demoRestaurante: Restaurante = {
  id: "vino-e-cucina-demo",
  slug: "vino-e-cucina",
  nome: "Vino e Cucina",
  subtitulo: "Ristorante Italiano",
  descricao: "Cozinha italiana autoral, massas frescas e vinhos selecionados.",
  horario: "Ter-Dom · 18h-23h",
  endereco: "Rua das Oliveiras, 128 - Jardins",
  whatsapp: "5511999999999",
  pedidoMinimo: 0,
  taxaEntrega: 0,
  deliveryAtivo: false,
  categorias: [
    { id: "antipasti", nome: "Antipasti", ordem: 1 },
    { id: "paste", nome: "Paste", ordem: 2 },
    { id: "principali", nome: "Principali", ordem: 3 },
    { id: "dolci", nome: "Dolci", ordem: 4 }
  ],
  pratos: [
    {
      id: "burrata-tomate-confit",
      categoriaId: "antipasti",
      nome: "Burrata com Tomate Confit",
      preco: 62,
      descricao:
        "Burrata fresca importada da Puglia, tomates cereja confitados com alho e tomilho, reducao de balsamico artesanal e azeite extra virgem siciliano.",
      ingredientes:
        "Burrata · Tomate Cereja · Alho · Tomilho · Balsamico · Manjericao · Azeite Siciliano",
      fotoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80",
      badge: "Chef Sugere",
      destaque: true,
      disponivel: true
    },
    {
      id: "bruschetta-pomodoro",
      categoriaId: "antipasti",
      nome: "Bruschetta al Pomodoro",
      preco: 38,
      descricao:
        "Pao artesanal grelhado, tomate San Marzano, alho, azeite extra virgem e folhas de manjericao fresco.",
      ingredientes: "Pao Artesanal · Tomate San Marzano · Alho · Azeite · Manjericao",
      fotoUrl: bruschetaImage.src,
      disponivel: true
    },
    {
      id: "carpaccio-manzo",
      categoriaId: "antipasti",
      nome: "Carpaccio di Manzo",
      preco: 74,
      descricao:
        "File mignon fatiado finissimo, rucula selvagem, parmesao 36 meses, alcaparras e emulsao de limao siciliano.",
      ingredientes: "File Mignon · Rucula · Parmesao 36m · Alcaparras · Limao Siciliano",
      fotoUrl: "https://images.unsplash.com/photo-1560717845-968823efbee1?w=700&q=80",
      disponivel: true
    },
    {
      id: "tagliatelle-ragu",
      categoriaId: "paste",
      nome: "Tagliatelle al Ragu",
      preco: 86,
      descricao:
        "Massa fresca da casa, ragu bolonhesa cozido lentamente por 8 horas e finalizado com parmesao.",
      ingredientes: "Tagliatelle · Ragu Bolonhesa · Parmesao · Vinho Tinto · Ervas",
      fotoUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&q=80",
      badge: "Mais Pedido",
      destaque: true,
      disponivel: true
    },
    {
      id: "ravioli-zucca",
      categoriaId: "paste",
      nome: "Ravioli di Zucca",
      preco: 78,
      descricao:
        "Ravioli recheado com abobora assada, manteiga noisette, salvia crocante e amendoas tostadas.",
      ingredientes: "Ravioli · Abobora · Manteiga · Salvia · Amendoas",
      fotoUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700&q=80",
      disponivel: true
    },
    {
      id: "risotto-funghi",
      categoriaId: "paste",
      nome: "Risotto ai Funghi",
      preco: 82,
      descricao:
        "Arroz carnaroli, mix de cogumelos frescos, vinho branco, manteiga gelada e parmesao.",
      ingredientes: "Carnaroli · Funghi · Vinho Branco · Parmesao · Manteiga",
      fotoUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=700&q=80",
      disponivel: true
    },
    {
      id: "ossobuco-milanese",
      categoriaId: "principali",
      nome: "Ossobuco alla Milanese",
      preco: 118,
      descricao:
        "Ossobuco braseado em vinho branco, legumes aromaticos, gremolata e risotto alla milanese.",
      ingredientes: "Ossobuco · Acafrao · Arroz · Vinho Branco · Gremolata",
      fotoUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&q=80",
      badge: "Especial",
      destaque: true,
      disponivel: true
    },
    {
      id: "branzino-limone",
      categoriaId: "principali",
      nome: "Branzino al Limone",
      preco: 104,
      descricao:
        "Peixe grelhado com molho de limao siciliano, legumes da estacao e azeite de ervas.",
      ingredientes: "Branzino · Limao Siciliano · Legumes · Azeite de Ervas",
      fotoUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=700&q=80",
      disponivel: true
    },
    {
      id: "tiramisu-classico",
      categoriaId: "dolci",
      nome: "Tiramisu Classico",
      preco: 36,
      descricao:
        "Creme mascarpone, biscoito champagne embebido em espresso, cacau belga e toque de marsala.",
      ingredientes: "Mascarpone · Espresso · Cacau · Marsala · Biscoito Champagne",
      fotoUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=700&q=80",
      badge: "Classico",
      disponivel: true
    },
    {
      id: "panna-cotta",
      categoriaId: "dolci",
      nome: "Panna Cotta ai Frutti Rossi",
      preco: 34,
      descricao:
        "Panna cotta cremosa com baunilha natural, calda de frutas vermelhas e crocante de pistache.",
      ingredientes: "Creme · Baunilha · Frutas Vermelhas · Pistache",
      fotoUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=700&q=80",
      disponivel: true
    }
  ]
};
