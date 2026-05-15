export type TipoEntrega = "retirada" | "delivery";

export interface Restaurante {
  id: string;
  slug: string;
  nome: string;
  subtitulo: string;
  descricao: string;
  horario: string;
  endereco: string;
  whatsapp: string;
  pedidoMinimo: number;
  taxaEntrega: number;
  deliveryAtivo: boolean;
  categorias: Categoria[];
  pratos: Prato[];
}

export interface Categoria {
  id: string;
  nome: string;
  ordem: number;
}

export interface Prato {
  id: string;
  categoriaId: string;
  nome: string;
  descricao: string;
  ingredientes: string;
  preco: number;
  fotoUrl: string;
  badge?: string;
  destaque?: boolean;
  disponivel: boolean;
}

export interface ItemCarrinho {
  prato: Prato;
  quantidade: number;
}

export interface ClienteCheckout {
  nome: string;
  telefone: string;
  tipoEntrega: TipoEntrega;
  enderecoEntrega?: string;
  observacoes?: string;
}

export interface PedidoSimulado {
  numero: number;
  restauranteId: string;
  restauranteNome: string;
  cliente: ClienteCheckout;
  itens: ItemCarrinho[];
  total: number;
  pagamentoStatus: "simulado";
  criadoEm: string;
}

export interface PedidoSimuladoPayload {
  restauranteId: string;
  restauranteNome: string;
  cliente: ClienteCheckout;
  itens: Array<{
    pratoId: string;
    nome: string;
    preco: number;
    quantidade: number;
  }>;
}
