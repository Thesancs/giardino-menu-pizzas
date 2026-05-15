# SDD — All In Cardápio Digital
**Software Design Document**  
**Versão:** 1.1  
**Data:** Maio 2026  
**Autor:** Glauber (All In)  
**Referência:** PRD-allin-cardapio v1.0  
**Status:** Pronto para implementação

> **⚠️ ATENÇÃO — V1 (Demo):** O pagamento na primeira versão é **simulado**. Nenhuma cobrança real ocorre. Ao confirmar o pedido, o sistema simula aprovação e envia a notificação automaticamente para um **grupo específico do WhatsApp** da equipe All In. Mercado Pago real entra apenas na V3.

---

## Sumário

1. [Premissas e Decisões de Arquitetura](#1-premissas-e-decisões-de-arquitetura)
2. [Estrutura de Pastas Definitiva](#2-estrutura-de-pastas-definitiva)
3. [Fases de Implementação — Ordem Exata](#3-fases-de-implementação--ordem-exata)
4. [Especificação por Módulo](#4-especificação-por-módulo)
5. [Banco de Dados — Schema Final](#5-banco-de-dados--schema-final)
6. [Segurança — Mapa de Riscos e Mitigações](#6-segurança--mapa-de-riscos-e-mitigações)
7. [Integração Mercado Pago](#7-integração-mercado-pago)
8. [Integração WhatsApp (Pedido Automático)](#8-integração-whatsapp-pedido-automático)
9. [Plano de Testes](#9-plano-de-testes)
10. [Variáveis de Ambiente](#10-variáveis-de-ambiente)
11. [Checklist por Fase](#11-checklist-por-fase)
12. [Erros Conhecidos e Como Tratar](#12-erros-conhecidos-e-como-tratar)

---

## 1. Premissas e Decisões de Arquitetura

### Premissas confirmadas

| # | Premissa | Decisão |
|---|---|---|
| 1 | Web app (não app nativo) | Next.js 14 App Router |
| 2 | Mobile-first | Tailwind CSS breakpoints mobile-first |
| 3 | Sem banco de dados na V1 | Dados hardcoded em `/data/demo-restaurante.ts` |
| 4 | **V1: pagamento simulado** | Sem Mercado Pago real — botão "Confirmar Pedido" simula aprovação instantânea |
| 4b | V3: pagamento real vai para conta do restaurante | Mercado Pago com credenciais do restaurante (não da All In) |
| 5 | V1 começa com retirada, sem delivery | Simplifica checkout e evita riscos operacionais |
| 6 | **V1: notificação vai para grupo WhatsApp da All In** | Grupo interno de testes — não para o restaurante final |
| 6b | V3: pedido confirmado vai para WhatsApp do restaurante | Evolution API ou Twilio com número do restaurante |
| 7 | Dois status separados: pagamento e operacional | Evita confusão entre "pago" e "entregue" |
| 8 | Builder solo | Sem CI/CD complexo, deploy manual via Vercel CLI |
| 9 | Foco Brasil | pt-BR, BRL, telefone BR, CEP BR |
| 10 | Primeiro delivery = taxa fixa por restaurante | Sem cálculo por bairro/distância na V3 |

### Decisão de roteamento por subdomínio

Na Vercel, subdomínios wildcard (`*.allinrestaurantes.com.br`) são resolvidos por `middleware.ts` que lê o `host` da requisição e injeta o `slug` no contexto. Isso permite que `pizzariadonajulia.allinrestaurantes.com.br` carregue os dados daquele restaurante sem rota `/[slug]` visível na URL.

**V1 (demo):** sem middleware, URL simples em `demo.allinrestaurantes.com.br`  
**V2+:** middleware ativo com resolução de slug por subdomínio

---

## 2. Estrutura de Pastas Definitiva

```
allin-cardapio/
│
├── app/
│   ├── layout.tsx                        # Layout raiz (fontes, metadata padrão)
│   ├── page.tsx                          # Redirect para /demo ou landing
│   │
│   ├── [slug]/                           # Cardápio público (V2+)
│   │   ├── layout.tsx                    # Metadata dinâmica do restaurante
│   │   ├── page.tsx                      # Cardápio principal
│   │   ├── confirmacao/page.tsx          # Tela pós-pagamento
│   │   └── admin/
│   │       ├── layout.tsx                # Layout do admin (sidebar, auth guard)
│   │       ├── page.tsx                  # Feed de pedidos em tempo real
│   │       ├── cardapio/page.tsx         # Gestão de pratos e categorias
│   │       └── configuracoes/page.tsx    # Config do restaurante
│   │
│   ├── demo/                             # Demo estática V1
│   │   └── page.tsx                      # Cardápio hardcoded
│   │
│   └── api/
│       ├── pedidos/
│       │   └── route.ts                  # GET (lista) | POST (criar pedido)
│       ├── pedidos/[id]/
│       │   └── route.ts                  # PATCH (atualizar status)
│       ├── pratos/
│       │   └── route.ts                  # GET | POST
│       ├── pratos/[id]/
│       │   └── route.ts                  # PATCH | DELETE
│       ├── pagamento/
│       │   ├── criar/route.ts            # POST — cria preferência no MP
│       │   └── webhook/route.ts          # POST — recebe notificações do MP
│       └── whatsapp/
│           └── route.ts                  # POST — envia mensagem ao restaurante
│
├── components/
│   ├── cardapio/
│   │   ├── CardapioShell.tsx             # Container principal com estado global
│   │   ├── Header.tsx                    # Logo, nome, horário, botão carrinho
│   │   ├── HeroBanner.tsx                # Foto de capa ou gradiente
│   │   ├── CategoriaNav.tsx              # Scroll horizontal de categorias
│   │   ├── SecaoCategoria.tsx            # Título + grid de cards
│   │   ├── PratoCard.tsx                 # Card normal
│   │   ├── PratoCardFeatured.tsx         # Card destaque (largura total)
│   │   ├── PratoModal.tsx                # Modal de detalhe + quantidade
│   │   ├── Carrinho.tsx                  # Painel lateral / bottom sheet
│   │   ├── CheckoutForm.tsx              # Dados do cliente + tipo de entrega
│   │   └── ConfirmacaoPedido.tsx         # Tela pós-pagamento aprovado
│   │
│   ├── admin/
│   │   ├── AdminShell.tsx                # Layout com sidebar + auth guard
│   │   ├── Sidebar.tsx                   # Navegação do admin
│   │   ├── PedidoFeed.tsx                # Feed realtime de pedidos
│   │   ├── PedidoCard.tsx                # Card de pedido com ações
│   │   ├── PratoForm.tsx                 # Formulário de criar/editar prato
│   │   ├── CategoriaForm.tsx             # Formulário de categoria
│   │   └── ConfigForm.tsx                # Formulário de config do restaurante
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── Badge.tsx
│       ├── Toggle.tsx
│       └── ColorPicker.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Client-side Supabase client
│   │   └── server.ts                     # Server-side Supabase client (cookies)
│   ├── mercadopago.ts                    # SDK e helpers do MP
│   ├── whatsapp.ts                       # Função de envio de mensagem
│   ├── formatters.ts                     # Formatação de moeda, telefone, data
│   └── validators.ts                     # Validações de formulário
│
├── hooks/
│   ├── useCarrinho.ts                    # Estado global do carrinho (Zustand)
│   ├── useRestaurante.ts                 # Dados do restaurante atual
│   └── usePedidosRealtime.ts             # Supabase Realtime para admin
│
├── data/
│   └── demo-restaurante.ts               # Dados hardcoded para V1
│
├── types/
│   └── index.ts                          # Tipos TypeScript globais
│
├── middleware.ts                         # Resolução de subdomínio → slug (V2+)
├── .env.local                            # Variáveis de ambiente (nunca commitado)
├── .env.example                          # Template de variáveis
└── next.config.ts                        # Config Next.js (domínios de imagem)
```

---

## 3. Fases de Implementação — Ordem Exata

A ordem abaixo é intencional. Cada fase tem dependência da anterior. Não pule etapas.

```
FASE 1 ──→ FASE 2 ──→ FASE 3 ──→ FASE 4 ──→ FASE 5
Demo      Multi-     Pagamento   WhatsApp   Painel
Estática  Tenant     + Pedidos   Automático Admin
```

### Ordem dentro de cada fase

#### Fase 1 — Demo Estática (V1)
```
1.1  Setup do projeto (next, tailwind, fontes)
1.2  Tipos TypeScript (Restaurante, Prato, Categoria, ItemCarrinho)
1.3  Dados hardcoded em data/demo-restaurante.ts
1.4  Componente Header
1.5  Componente HeroBanner
1.6  Componente CategoriaNav (scroll horizontal + sticky)
1.7  Componente PratoCard (normal)
1.8  Componente PratoCardFeatured (destaque)
1.9  Componente SecaoCategoria (agrupa cards por categoria)
1.10 Hook useCarrinho (Zustand — estado local)
1.11 Componente PratoModal (detalhe + quantidade)
1.12 Componente Carrinho (painel lateral)
1.13 Componente Toast
1.14 Página demo/page.tsx (monta tudo junto)
1.15 Responsividade mobile (testar em 375px, 390px, 414px)
1.16 Deploy Vercel + domínio demo.allinrestaurantes.com.br
```

#### Fase 2 — Multi-Tenant + Supabase (V2)
```
2.1  Setup Supabase (projeto, tabelas, RLS)
2.2  Supabase Auth (login admin)
2.3  lib/supabase/client.ts e server.ts
2.4  API Route: GET /api/pratos?restaurante_id=X
2.5  API Route: POST/PATCH/DELETE /api/pratos/[id]
2.6  API Route: GET/POST /api/categorias
2.7  middleware.ts — resolve subdomínio → slug
2.8  [slug]/page.tsx — carrega dados reais do Supabase
2.9  [slug]/admin — auth guard + AdminShell
2.10 Admin: gestão de pratos (PratoForm + lista)
2.11 Admin: gestão de categorias
2.12 Admin: configurações do restaurante
2.13 Supabase Storage — upload de imagens
2.14 Color picker → CSS variables dinâmicas por restaurante
2.15 Wildcard DNS na Vercel
```

#### Fase 3 — Pagamento (V3)
```
3.1  Configurar credenciais MP por restaurante (campo na tabela restaurantes)
3.2  lib/mercadopago.ts — criar preferência de pagamento
3.3  API Route: POST /api/pagamento/criar
3.4  Componente CheckoutForm (dados do cliente)
3.5  Fluxo de redirect para MP Checkout Pro
3.6  Tabela pedidos no Supabase
3.7  API Route: POST /api/pagamento/webhook (validação de assinatura)
3.8  Webhook: ao receber pagamento aprovado → salva pedido no banco
3.9  Página [slug]/confirmacao — tela pós-pagamento
3.10 Testar fluxo completo com pagamento real de R$ 1,00
```

#### Fase 4 — WhatsApp Automático (V3)
```
4.1  Escolher provider (Evolution API ou Twilio)
4.2  lib/whatsapp.ts — função sendPedidoWhatsApp(pedido, restaurante)
4.3  Template da mensagem de pedido
4.4  Chamar sendPedidoWhatsApp() no webhook após pagamento aprovado
4.5  Testar entrega da mensagem com pedido real
4.6  Fallback: se WhatsApp falhar, pedido ainda fica salvo no banco
```

#### Fase 5 — Painel Admin de Pedidos (V3)
```
5.1  hooks/usePedidosRealtime.ts — Supabase Realtime
5.2  Componente PedidoFeed (lista com atualização automática)
5.3  Componente PedidoCard (status + ações)
5.4  API Route: PATCH /api/pedidos/[id] — atualizar status_operacional
5.5  Som de notificação em novo pedido
5.6  Filtro por status
5.7  Histórico (últimos 30 dias)
5.8  Painel interno All In — visão de todos os pedidos de todos os restaurantes
```

---

## 4. Especificação por Módulo

### 4.1 — Cardápio Público

#### Estado global (Zustand — `useCarrinho`)
```typescript
interface CarrinhoState {
  itens: ItemCarrinho[]
  restauranteId: string
  adicionarItem: (prato: Prato, quantidade: number) => void
  removerItem: (pratoId: string) => void
  alterarQuantidade: (pratoId: string, quantidade: number) => void
  limpar: () => void
  total: number        // computed
  quantidadeTotal: number  // computed
}
```

#### Regras do carrinho
- Carrinho só pode ter itens do mesmo restaurante — ao adicionar de outro, exibir alerta
- Quantidade mínima por item: 1
- Ao fechar o modal sem adicionar, carrinho não muda
- Itens sem `disponivel = true` não aparecem no cardápio

#### CategoriaNav — comportamento
- Categorias em scroll horizontal sem scrollbar visível
- Ao clicar em categoria: scroll suave até a seção correspondente (`scrollIntoView`)
- Categoria ativa é determinada por `IntersectionObserver` — não por clique
- Sticky abaixo do Header (top = altura do Header, normalmente 64px)

#### Cardápio fora do horário
- Se restaurante estiver fechado, exibir banner "Restaurante fechado agora"
- Botão de adicionar ao carrinho fica desabilitado
- Checkout bloqueado com mensagem explicativa

---

### 4.2 — Checkout e Pagamento

#### Campos obrigatórios no CheckoutForm
```
nome_cliente        string  required
telefone            string  required  (máscara BR: (99) 99999-9999)
tipo_entrega        enum    required  ('retirada' | 'delivery')
endereco_entrega    string  required se tipo_entrega === 'delivery'
observacoes         string  optional
```

#### Validações antes de criar pagamento
- Total >= pedido_minimo do restaurante
- Restaurante está ativo e dentro do horário
- Todos os itens do carrinho ainda estão disponíveis (verificar no banco antes de criar preferência)
- Telefone válido (regex BR)

#### Fluxo de pagamento
```
1. Cliente clica "Finalizar pedido"
2. Frontend chama POST /api/pagamento/criar com { itens, cliente, restaurante_id }
3. API valida itens no banco (preços reais, disponibilidade)
4. API cria preferência no Mercado Pago com credenciais do restaurante
5. API retorna { preference_id, init_point }
6. Frontend redireciona para init_point (checkout MP)
7. Cliente paga
8. MP redireciona para [slug]/confirmacao?payment_id=X&status=Y
9. MP envia webhook para /api/pagamento/webhook
10. Webhook valida assinatura, salva pedido, dispara WhatsApp
```

**CRÍTICO:** O preço dos itens DEVE ser validado no servidor (passo 3), nunca confiar no preço vindo do frontend.

---

### 4.3 — Webhook Mercado Pago

O webhook é a parte mais sensível do sistema. Falha aqui = pedido pago que não chega ao restaurante.

#### Fluxo do webhook
```typescript
// /api/pagamento/webhook/route.ts
export async function POST(req: Request) {
  // 1. Validar assinatura HMAC-SHA256
  // 2. Parsear body
  // 3. Se type !== 'payment', ignorar (retornar 200)
  // 4. Buscar detalhes do pagamento na API do MP
  // 5. Se status !== 'approved', registrar mas não processar
  // 6. Verificar idempotência (pedido já existe com este payment_id?)
  // 7. Buscar itens do carrinho salvo (via external_reference)
  // 8. Criar pedido no banco com status_operacional = 'novo'
  // 9. Disparar WhatsApp
  // 10. Retornar 200 imediatamente
}
```

#### Idempotência
O MP pode enviar o mesmo webhook múltiplas vezes. Antes de criar o pedido, verificar:
```sql
SELECT id FROM pedidos WHERE pagamento_id = $1 LIMIT 1
```
Se já existir, retornar 200 sem processar novamente.

#### external_reference
Ao criar a preferência de pagamento, salvar um `external_reference` com o ID temporário do pedido ou um UUID gerado no frontend. Isso permite recuperar os itens do carrinho quando o webhook chegar.

Estratégia: salvar o carrinho em uma tabela `carrinhos_pendentes` antes do redirect, e deletar após o pedido ser criado.

```sql
-- Tabela auxiliar
CREATE TABLE carrinhos_pendentes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dados       jsonb NOT NULL,   -- snapshot completo do carrinho
  criado_em   timestamptz DEFAULT now(),
  expira_em   timestamptz DEFAULT now() + interval '2 hours'
);
```

---

### 4.4 — Dashboard Admin (Pedidos Realtime)

#### Supabase Realtime
```typescript
// hooks/usePedidosRealtime.ts
const channel = supabase
  .channel('pedidos-restaurante')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'pedidos',
    filter: `restaurante_id=eq.${restauranteId}`
  }, (payload) => {
    // Tocar som + adicionar pedido ao topo da lista
  })
  .subscribe()
```

#### Som de notificação
- Arquivo `/public/sounds/novo-pedido.mp3`
- Tocar apenas em INSERT (novo pedido)
- Usuário deve interagir com a página antes (browser policy) — exibir botão "Ativar notificações sonoras" ao entrar no admin

---

## 5. Banco de Dados — Schema Final

### Diferença do PRD: dois campos de status separados

```sql
-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Restaurantes
CREATE TABLE restaurantes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text UNIQUE NOT NULL,
  nome              text NOT NULL,
  descricao         text,
  logo_url          text,
  capa_url          text,
  cor_primaria      text NOT NULL DEFAULT '#E85D04',
  cor_secundaria    text NOT NULL DEFAULT '#F48C06',
  whatsapp          text NOT NULL,         -- número que recebe pedidos
  horario           text,
  endereco          text,
  pedido_minimo     numeric NOT NULL DEFAULT 0,
  taxa_entrega      numeric NOT NULL DEFAULT 0,
  delivery_ativo    boolean NOT NULL DEFAULT false,
  ativo             boolean NOT NULL DEFAULT true,
  mp_access_token   text,                  -- credencial MP do restaurante (criptografada)
  criado_em         timestamptz NOT NULL DEFAULT now()
);

-- Categorias
CREATE TABLE categorias (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id  uuid NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  nome            text NOT NULL,
  ordem           int NOT NULL DEFAULT 0,
  ativo           boolean NOT NULL DEFAULT true
);

-- Pratos
CREATE TABLE pratos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id  uuid NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  categoria_id    uuid NOT NULL REFERENCES categorias(id),
  nome            text NOT NULL,
  descricao       text,
  ingredientes    text,
  preco           numeric NOT NULL CHECK (preco > 0),
  foto_url        text,
  badge           text,
  destaque        boolean NOT NULL DEFAULT false,
  disponivel      boolean NOT NULL DEFAULT true,
  ordem           int NOT NULL DEFAULT 0,
  criado_em       timestamptz NOT NULL DEFAULT now()
);

-- Carrinhos pendentes (auxiliar para webhook)
CREATE TABLE carrinhos_pendentes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dados       jsonb NOT NULL,
  criado_em   timestamptz NOT NULL DEFAULT now(),
  expira_em   timestamptz NOT NULL DEFAULT now() + interval '2 hours'
);

-- Pedidos
CREATE TABLE pedidos (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id      uuid NOT NULL REFERENCES restaurantes(id),
  numero              int GENERATED ALWAYS AS IDENTITY,
  cliente_nome        text NOT NULL,
  cliente_telefone    text NOT NULL,
  cliente_email       text,
  itens               jsonb NOT NULL,       -- snapshot dos pratos no momento do pedido
  subtotal            numeric NOT NULL,
  taxa_entrega        numeric NOT NULL DEFAULT 0,
  total               numeric NOT NULL,
  tipo_entrega        text NOT NULL DEFAULT 'retirada' CHECK (tipo_entrega IN ('retirada','delivery')),
  endereco_entrega    text,
  observacoes         text,
  -- Status de pagamento (espelho do MP)
  pagamento_provider  text NOT NULL DEFAULT 'mercadopago',
  pagamento_id        text UNIQUE,          -- ID do MP — UNIQUE para idempotência
  pagamento_status    text NOT NULL DEFAULT 'pendente'
                      CHECK (pagamento_status IN ('pendente','aprovado','recusado','cancelado','estornado')),
  -- Status operacional (controlado pelo restaurante)
  status_operacional  text NOT NULL DEFAULT 'novo'
                      CHECK (status_operacional IN ('novo','aceito','preparando','pronto','entregue','cancelado')),
  criado_em           timestamptz NOT NULL DEFAULT now(),
  atualizado_em       timestamptz NOT NULL DEFAULT now()
);

-- Admins
CREATE TABLE admins (
  id              uuid PRIMARY KEY REFERENCES auth.users(id),
  restaurante_id  uuid NOT NULL REFERENCES restaurantes(id),
  nome            text NOT NULL
);

-- Índices
CREATE INDEX idx_pedidos_restaurante ON pedidos(restaurante_id);
CREATE INDEX idx_pedidos_pagamento_id ON pedidos(pagamento_id);
CREATE INDEX idx_pratos_restaurante ON pratos(restaurante_id);
CREATE INDEX idx_pratos_categoria ON pratos(categoria_id);
CREATE INDEX idx_categorias_restaurante ON categorias(restaurante_id);

-- Trigger: atualiza atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN NEW.atualizado_em = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pedidos_atualizado_em
BEFORE UPDATE ON pedidos
FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();
```

### Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE restaurantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE pratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Cardápio público: qualquer um pode LER pratos e categorias de restaurantes ativos
CREATE POLICY "cardapio_publico_pratos" ON pratos
  FOR SELECT USING (
    disponivel = true AND
    EXISTS (SELECT 1 FROM restaurantes r WHERE r.id = pratos.restaurante_id AND r.ativo = true)
  );

CREATE POLICY "cardapio_publico_categorias" ON categorias
  FOR SELECT USING (
    ativo = true AND
    EXISTS (SELECT 1 FROM restaurantes r WHERE r.id = categorias.restaurante_id AND r.ativo = true)
  );

-- Admin só acessa dados do próprio restaurante
CREATE POLICY "admin_proprio_restaurante" ON pedidos
  FOR ALL USING (
    restaurante_id = (SELECT restaurante_id FROM admins WHERE id = auth.uid())
  );

CREATE POLICY "admin_pratos" ON pratos
  FOR ALL USING (
    restaurante_id = (SELECT restaurante_id FROM admins WHERE id = auth.uid())
  );

-- Service Role (usado pelas API Routes server-side) tem acesso total
-- Configurado automaticamente pelo Supabase — usar SUPABASE_SERVICE_ROLE_KEY nas API Routes
```

---

## 6. Segurança — Mapa de Riscos e Mitigações

### 6.1 — Manipulação de Preços no Frontend

**Risco:** cliente inspeciona o código, altera o preço de um prato para R$ 0,01 e envia o carrinho.

**Mitigação:**
- NUNCA usar preços vindos do frontend para criar a preferência de pagamento
- API Route `/api/pagamento/criar` SEMPRE busca preços diretamente do banco
- Validar que cada `prato_id` pertence ao `restaurante_id` informado

```typescript
// ERRADO — nunca fazer isso
const total = req.body.itens.reduce((s, i) => s + i.preco * i.quantidade, 0)

// CERTO — buscar preço real do banco
const pratos = await supabase
  .from('pratos')
  .select('id, preco, disponivel')
  .in('id', itensSolicitados.map(i => i.prato_id))
  .eq('restaurante_id', restauranteId)
```

---

### 6.2 — Webhook Falso do Mercado Pago

**Risco:** atacante envia uma requisição POST falsa para `/api/pagamento/webhook` fingindo que um pagamento foi aprovado.

**Mitigação:** validar assinatura HMAC-SHA256 fornecida pelo MP

```typescript
import crypto from 'crypto'

function validarAssinaturaMP(req: Request, secret: string): boolean {
  const xSignature = req.headers.get('x-signature')      // ts=...,v1=...
  const xRequestId = req.headers.get('x-request-id')
  const dataId = new URL(req.url).searchParams.get('data.id')

  if (!xSignature || !xRequestId) return false

  const parts = Object.fromEntries(xSignature.split(',').map(p => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const hash = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  return hash === v1
}
```

Se a validação falhar, retornar `401` imediatamente sem processar.

---

### 6.3 — Pedido Duplicado (Webhook Duplo)

**Risco:** MP envia o mesmo webhook 2x. Restaurante recebe 2 pedidos iguais e 2 mensagens no WhatsApp.

**Mitigação:** constraint `UNIQUE` em `pedidos.pagamento_id` + verificação antes de inserir

```typescript
// Verificar antes de inserir
const { data: existente } = await supabase
  .from('pedidos')
  .select('id')
  .eq('pagamento_id', paymentId)
  .single()

if (existente) {
  return new Response('OK', { status: 200 }) // já processado, ignorar
}
```

---

### 6.4 — Acesso Indevido ao Admin

**Risco:** admin de um restaurante acessa dados de outro restaurante via URL direta.

**Mitigações:**
1. RLS no Supabase (linha 5.0) — banco rejeita queries não autorizadas
2. Auth guard no layout do admin:

```typescript
// app/[slug]/admin/layout.tsx
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

const { data: admin } = await supabase
  .from('admins')
  .select('restaurante_id')
  .eq('id', user.id)
  .single()

if (!admin || admin.restaurante_id !== restaurante.id) {
  redirect('/unauthorized')
}
```

---

### 6.5 — Exposição do Token do Mercado Pago

**Risco:** `mp_access_token` do restaurante fica exposto no código cliente ou em respostas de API.

**Mitigações:**
- Token salvo criptografado no banco (AES-256 com `ENCRYPTION_KEY` na `.env`)
- Nunca retornar o token em nenhum endpoint GET
- Usar apenas em API Routes server-side (nunca em `'use client'`)
- Rotacionar via painel admin da All In, não via restaurante

---

### 6.6 — Upload de Imagens Maliciosas

**Risco:** admin faz upload de arquivo `.php` ou `.exe` renomeado como `.jpg`.

**Mitigações:**
```typescript
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']
const TAMANHO_MAXIMO = 5 * 1024 * 1024 // 5MB

if (!TIPOS_PERMITIDOS.includes(file.type)) {
  throw new Error('Tipo de arquivo não permitido')
}
if (file.size > TAMANHO_MAXIMO) {
  throw new Error('Arquivo muito grande (máximo 5MB)')
}

// Validar magic bytes (não confiar apenas no Content-Type)
const buffer = await file.arrayBuffer()
const bytes = new Uint8Array(buffer)
const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8
const isPNG  = bytes[0] === 0x89 && bytes[1] === 0x50
const isWEBP = bytes[8] === 0x57 && bytes[9] === 0x45
```

---

### 6.7 — Rate Limiting no Checkout

**Risco:** bot cria centenas de pedidos falsos, sobrecarregando o banco e gerando custos no MP.

**Mitigação:** rate limiting por IP na API Route de criação de pedido

```typescript
// Usar Vercel KV ou Upstash Redis
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(5, '10 m') // 5 tentativas a cada 10 minutos por IP
})

const { success } = await ratelimit.limit(ip)
if (!success) return new Response('Too Many Requests', { status: 429 })
```

---

### 6.8 — Restaurante Fechado Aceita Pedido

**Risco:** cliente finaliza pedido fora do horário, restaurante não vê, produto não é entregue.

**Mitigação:** validar horário de funcionamento no servidor antes de criar preferência MP

```typescript
function restauranteEstaAberto(horario: string): boolean {
  // Parsear string "Seg–Sex 11h–22h | Sáb–Dom 11h–23h"
  // Comparar com horário atual em America/Sao_Paulo
  // Retornar boolean
}

if (!restauranteEstaAberto(restaurante.horario)) {
  return NextResponse.json(
    { error: 'Restaurante fechado no momento' },
    { status: 422 }
  )
}
```

---

### 6.9 — Carrinho com Item Indisponível

**Risco:** cliente adiciona prato ao carrinho, admin pausa o prato, cliente finaliza pedido — prato indisponível no banco mas no pedido.

**Mitigação:** verificar disponibilidade de todos os itens do carrinho antes de criar preferência

```typescript
const { data: pratos } = await supabase
  .from('pratos')
  .select('id, disponivel')
  .in('id', itensSolicitados.map(i => i.prato_id))

const indisponiveis = pratos?.filter(p => !p.disponivel)
if (indisponiveis?.length) {
  return NextResponse.json({
    error: 'Alguns itens não estão mais disponíveis',
    itens: indisponiveis.map(p => p.id)
  }, { status: 422 })
}
```

---

### Tabela resumo de riscos

| # | Risco | Severidade | Status |
|---|---|---|---|
| 6.1 | Manipulação de preço no frontend | 🔴 Crítico | Validação server-side obrigatória |
| 6.2 | Webhook falso do MP | 🔴 Crítico | HMAC-SHA256 obrigatório |
| 6.3 | Pedido duplicado | 🟠 Alto | UNIQUE constraint + idempotência |
| 6.4 | Acesso indevido ao admin | 🟠 Alto | RLS + auth guard |
| 6.5 | Exposição do token MP | 🟠 Alto | Criptografia + server-side only |
| 6.6 | Upload malicioso | 🟡 Médio | Validação de tipo + magic bytes |
| 6.7 | Rate limiting | 🟡 Médio | Upstash Redis |
| 6.8 | Pedido fora do horário | 🟡 Médio | Validação server-side |
| 6.9 | Item indisponível no checkout | 🟡 Médio | Verificação antes de criar preferência |

---

## 7. Pagamento Simulado — V1 (Demo)

### Objetivo
Demonstrar o fluxo completo — carrinho → checkout → confirmação → notificação WhatsApp — **sem nenhuma cobrança real** e sem depender de credenciais do Mercado Pago. Usado para pitch, validação interna e testes com a equipe All In.

### Como funciona

```
Cliente monta pedido
→ Preenche nome e telefone
→ Clica "Confirmar Pedido"
→ Loader de 1.5s (simula processamento)
→ Tela de confirmação com número do pedido
→ API Route dispara mensagem para grupo WhatsApp da All In
```

Sem redirect externo. Sem cobrança. Sem webhook. Tudo dentro da própria aplicação.

### Fluxo técnico

```typescript
// app/api/pedido-simulado/route.ts
export async function POST(req: Request) {
  const { itens, cliente, restauranteId } = await req.json()

  // 1. Validações básicas
  if (!cliente.nome || !cliente.telefone || !itens.length) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  // 2. Gerar número amigável do pedido
  const numeroPedido = Math.floor(Math.random() * 900) + 100 // ex: #347

  // 3. Montar objeto do pedido
  const pedido = {
    numero: numeroPedido,
    cliente,
    itens,
    total: calcularTotal(itens),
    tipo_entrega: 'retirada',
    criado_em: new Date().toISOString(),
    pagamento_status: 'simulado' // flag explícita — não é pagamento real
  }

  // 4. Enviar para grupo WhatsApp da All In
  await enviarPedidoGrupoAllIn(pedido)

  // 5. Retornar confirmação
  return NextResponse.json({ sucesso: true, numero: numeroPedido })
}
```

### Destino da notificação: Grupo WhatsApp da All In

Na V1, a mensagem vai para um **grupo específico do WhatsApp da equipe All In** — não para nenhum restaurante cliente. Isso permite que a equipe valide o fluxo completo sem expor nada para fora.

```typescript
// lib/whatsapp.ts

// ID do grupo interno — formato Evolution API: "XXXXXXXXXXX-XXXXXXXXXX@g.us"
const GRUPO_ALLIN_TESTES = process.env.WHATSAPP_GRUPO_ALLIN_ID

export async function enviarPedidoGrupoAllIn(pedido: PedidoSimulado): Promise<void> {
  const mensagem = formatarMensagemPedidoSimulado(pedido)

  try {
    await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${GRUPO_ALLIN_TESTES}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.EVOLUTION_API_KEY!
      },
      body: JSON.stringify({ text: mensagem })
    })
  } catch (error) {
    // Falha no WhatsApp não quebra o fluxo da demo
    console.error('[Demo] Falha ao enviar para grupo All In:', error)
  }
}
```

### Template da mensagem de teste

```
🧪 *[DEMO] PEDIDO SIMULADO — All In Cardápio*
⚠️ Nenhum pagamento foi realizado.

*Restaurante:* {{nome_restaurante}}
*Pedido:* #{{numero}}
*Horário:* {{hora}}

*Cliente (teste):*
Nome: {{cliente_nome}}
Tel: {{cliente_telefone}}

*Itens:*
{{itens_formatados}}

*Retirada:* No local
*Total simulado:* R$ {{total}}

Pagamento: SIMULADO ✓
```

O prefixo `[DEMO]` e o aviso explícito evitam confusão com pedidos reais durante testes.

### Variáveis de ambiente necessárias para V1

```bash
EVOLUTION_API_URL=https://...
EVOLUTION_API_KEY=...
WHATSAPP_GRUPO_ALLIN_ID=XXXXXXXXXXX-XXXXXXXXXX@g.us  # ID do grupo interno
```

### O que NÃO existe na V1

| Item | Status |
|---|---|
| Chamada ao Mercado Pago | ❌ Não existe |
| Webhook de pagamento | ❌ Não existe |
| Banco de dados (pedidos persistidos) | ❌ Não existe — pedido só vai ao WhatsApp |
| Cobrança real | ❌ Não existe |
| Credenciais financeiras | ❌ Não necessárias |

### Feature flag para ativar pagamento real (V3)

A transição da demo para pagamento real é feita via uma variável de ambiente — sem alterar nenhum componente de UI:

```typescript
// components/cardapio/CheckoutForm.tsx
const endpoint = process.env.NEXT_PUBLIC_PAGAMENTO_REAL === 'true'
  ? '/api/pagamento/criar'       // V3 — Mercado Pago real
  : '/api/pedido-simulado'       // V1 — simulação
```

Quando chegar a hora, basta trocar a variável na Vercel e fazer redeploy. Nenhuma linha de UI muda.

---

## 7b. Integração Mercado Pago — V3

### Setup por restaurante

Cada restaurante tem seu próprio `mp_access_token`. A All In coleta e configura via CS no onboarding.

```typescript
// lib/mercadopago.ts
import { MercadoPagoConfig, Preference } from 'mercadopago'

export function getMPClient(accessToken: string) {
  return new MercadoPagoConfig({ accessToken })
}

export async function criarPreferencia(
  client: MercadoPagoConfig,
  pedido: PedidoParaCriar,
  restaurante: Restaurante,
  carrinhoId: string
) {
  const preference = new Preference(client)

  return preference.create({
    body: {
      items: pedido.itens.map(item => ({
        id: item.prato_id,
        title: item.nome,
        quantity: item.quantidade,
        unit_price: item.preco,   // preço validado do banco, não do frontend
        currency_id: 'BRL'
      })),
      payer: {
        name: pedido.cliente_nome,
        phone: { number: pedido.cliente_telefone }
      },
      external_reference: carrinhoId,  // para recuperar itens no webhook
      back_urls: {
        success: `https://${restaurante.slug}.allinrestaurantes.com.br/confirmacao`,
        failure: `https://${restaurante.slug}.allinrestaurantes.com.br/confirmacao?erro=1`,
        pending: `https://${restaurante.slug}.allinrestaurantes.com.br/confirmacao?pendente=1`
      },
      auto_return: 'approved',
      notification_url: `https://allinrestaurantes.com.br/api/pagamento/webhook`,
      statement_descriptor: restaurante.nome.substring(0, 22)
    }
  })
}
```

### Ambientes

```
Desenvolvimento:   usar credenciais de SANDBOX do MP (prefixo TEST-)
Produção:          usar credenciais de produção do restaurante
```

**Nunca misturar credenciais de sandbox com produção.**

---

## 8. Integração WhatsApp (Pedido Automático)

### Provider recomendado: Evolution API (auto-hospedado) ou Twilio

Para início recomendo **Evolution API** — open source, sem custo por mensagem, conecta ao número do restaurante via QR Code.

### Template da mensagem

```
🍽️ *NOVO PEDIDO PAGO — All In Cardápio*

*Restaurante:* {{nome_restaurante}}
*Pedido:* #{{numero}}
*Horário:* {{hora}}

*Cliente:*
Nome: {{cliente_nome}}
Tel: {{cliente_telefone}}

*Itens:*
{{itens_formatados}}

*Entrega:* {{tipo_entrega}}
{{endereco_se_delivery}}
*Subtotal:* R$ {{subtotal}}
*Taxa de entrega:* R$ {{taxa_entrega}}
*Total pago:* R$ {{total}}

✅ *Pagamento aprovado*
ID: {{pagamento_id}}
```

### Implementação

```typescript
// lib/whatsapp.ts
export async function enviarPedidoWhatsApp(
  pedido: Pedido,
  restaurante: Restaurante
): Promise<void> {
  const mensagem = formatarMensagemPedido(pedido, restaurante)

  try {
    await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${restaurante.whatsapp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.EVOLUTION_API_KEY!
      },
      body: JSON.stringify({ text: mensagem })
    })
  } catch (error) {
    // IMPORTANTE: falha no WhatsApp NÃO deve cancelar o pedido
    // Logar erro e seguir em frente — pedido já foi salvo no banco
    console.error('[WhatsApp] Falha ao enviar pedido:', error)
    // TODO: enviar para fila de retry ou notificar All In
  }
}
```

**Regra crítica:** falha no envio do WhatsApp nunca cancela o pedido. O pedido já foi pago e salvo. O restaurante verá no painel.

---

## 9. Plano de Testes

### 9.1 — Testes da V1 (Demo)

| Teste | Como testar | Critério de sucesso |
|---|---|---|
| Renderização mobile | Chrome DevTools 375px | Sem overflow horizontal |
| Scroll de categorias | Deslizar na barra de categorias | Scroll suave sem scrollbar visível |
| Category active state | Rolar a página | Categoria ativa muda conforme scroll |
| Adicionar item ao carrinho | Clicar "+" em qualquer prato | Badge do carrinho incrementa |
| Modal de prato | Clicar no card | Modal abre com dados corretos |
| Seletor de quantidade | Clicar "+" e "−" no modal | Preço atualiza proporcionalmente |
| Remover item | Remover item no carrinho | Total recalcula |
| Toast | Adicionar item | Toast aparece por ~2.4s |
| Responsividade desktop | Janela 1280px | Grid 3 colunas, sem quebras |
| Performance | Lighthouse mobile | Score > 85 |

### 9.2 — Testes da V2 (Multi-tenant)

| Teste | Como testar | Critério de sucesso |
|---|---|---|
| Isolamento de dados | Admin A acessa slug B via URL | Retorno 403 ou redirect |
| RLS — leitura pública | Query sem auth em pratos de restaurante inativo | Zero resultados |
| Upload de imagem | Upload de `.exe` renomeado `.jpg` | Rejeição com mensagem de erro |
| Upload de imagem válida | Upload de `.jpg` de 4MB | Imagem aparece no cardápio |
| Color picker | Trocar cor primária no admin | Cardápio muda a cor em tempo real |
| Subdomínio | Acessar `teste.allinrestaurantes.com.br` | Cardápio do restaurante "teste" carrega |

### 9.3 — Testes da V3 (Pagamento)

| Teste | Como testar | Critério de sucesso |
|---|---|---|
| Preço não manipulável | Alterar preço via DevTools + finalizar | Pedido criado com preço do banco |
| Webhook falso | POST manual para `/api/pagamento/webhook` sem assinatura | Retorno 401 |
| Webhook duplicado | Reenviar mesmo webhook 2x | Apenas 1 pedido criado no banco |
| Pagamento aprovado | Usar cartão de teste do MP sandbox | Pedido salvo + mensagem WhatsApp |
| Pagamento recusado | Usar cartão de teste recusado do MP | Tela de erro, sem pedido criado |
| Restaurante fechado | Tentar checkout fora do horário | Mensagem de erro, sem preferência criada |
| Item indisponível | Pausar item após adicionar ao carrinho, finalizar | Erro com lista de itens indisponíveis |
| Pedido mínimo | Tentar pedido abaixo do mínimo | Erro antes do checkout |
| Rate limiting | 6 tentativas de checkout em 10 min no mesmo IP | 6ª retorna 429 |

### 9.4 — Teste de Carga (pré-lançamento)

- Simular 50 acessos simultâneos ao cardápio com k6 ou Artillery
- Verificar tempo de resposta < 500ms no P95
- Verificar que Supabase não estrangula conexões

### 9.5 — Cartões de Teste Mercado Pago

```
Aprovado:   5031 7557 3453 0604  CVV: 123  Validade: 11/25
Recusado:   4000 0000 0000 0002  CVV: 123  Validade: 11/25
```

---

## 10. Variáveis de Ambiente

```bash
# .env.example

# ─────────────────────────────────────────
# V1 — DEMO (únicas variáveis necessárias)
# ─────────────────────────────────────────

# WhatsApp — Evolution API
EVOLUTION_API_URL=https://...
EVOLUTION_API_KEY=...
WHATSAPP_GRUPO_ALLIN_ID=XXXXXXXXXXX-XXXXXXXXXX@g.us  # ID do grupo interno All In

# Feature flag — pagamento real ativo?
NEXT_PUBLIC_PAGAMENTO_REAL=false   # manter false na V1, trocar para true na V3

# App
NEXT_PUBLIC_APP_URL=https://demo.allinrestaurantes.com.br
NODE_ENV=development


# ─────────────────────────────────────────
# V2+ — SAAS (adicionar quando chegar a hora)
# ─────────────────────────────────────────

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...          # Público — usado no client
SUPABASE_SERVICE_ROLE_KEY=eyJ...              # SECRETO — somente API Routes


# ─────────────────────────────────────────
# V3 — PAGAMENTO REAL (adicionar quando chegar a hora)
# ─────────────────────────────────────────

# Mercado Pago
MP_WEBHOOK_SECRET=...                         # Para validar assinatura HMAC
# Nota: mp_access_token é por restaurante, salvo no banco criptografado

# Criptografia (para mp_access_token no banco)
ENCRYPTION_KEY=...                            # 32 bytes hex — gerar com: openssl rand -hex 32

# Ativar pagamento real
NEXT_PUBLIC_PAGAMENTO_REAL=true
```

### Regras de segurança das variáveis

- Variáveis com `NEXT_PUBLIC_` são expostas no browser — NUNCA colocar segredos nelas
- `SUPABASE_SERVICE_ROLE_KEY` nunca vai para o cliente — somente em API Routes e Server Components
- `.env.local` nunca vai para o git — verificar `.gitignore`
- Em produção, configurar via Vercel Environment Variables (não via arquivo)

---

## 11. Checklist por Fase

### ✅ Fase 1 — Demo (antes de mostrar para qualquer cliente)
- [ ] Cardápio carrega em < 2s no 4G simulado
- [ ] Nenhum item com overflow no mobile 375px
- [ ] Carrinho funciona sem erros no console
- [ ] Toast aparece e desaparece corretamente
- [ ] Lighthouse mobile score > 85
- [ ] **Pagamento simulado:** loader 1.5s + tela de confirmação com número do pedido
- [ ] **Mensagem chega no grupo WhatsApp da All In** com todos os dados do pedido
- [ ] Prefixo `[DEMO]` e aviso de simulação presentes na mensagem
- [ ] Falha na API WhatsApp não quebra o fluxo (testar desconectando a API)
- [ ] Deploy na Vercel funcionando
- [ ] URL demo.allinrestaurantes.com.br acessível
- [ ] Variáveis `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `WHATSAPP_GRUPO_ALLIN_ID` configuradas na Vercel

### ✅ Fase 2 — Multi-tenant (antes do primeiro cliente real)
- [ ] RLS habilitado em todas as tabelas
- [ ] Admin não consegue ver dados de outro restaurante
- [ ] Upload de imagens funciona e rejeita tipos inválidos
- [ ] Subdomínio wildcard configurado na Vercel
- [ ] Color picker salva e aplica as cores corretamente
- [ ] Login/logout do admin funcionando

### ✅ Fase 3 — Pagamento (antes de cobrar qualquer pedido real)
- [ ] Teste de ponta-a-ponta com R$ 1,00 real aprovado
- [ ] Webhook com assinatura inválida retorna 401
- [ ] Webhook duplicado não cria pedido duplicado
- [ ] Preço manipulado no frontend não afeta o total cobrado
- [ ] Mensagem WhatsApp chegou no número do restaurante
- [ ] Tela de confirmação exibe número do pedido
- [ ] Rate limiting funcionando (testar manualmente)
- [ ] Variáveis de produção configuradas na Vercel (não sandbox)

---

## 12. Erros Conhecidos e Como Tratar

| Erro | Causa provável | Solução |
|---|---|---|
| Webhook recebido mas pedido não criado | `external_reference` não encontrado em `carrinhos_pendentes` | Verificar se carrinho expirou (TTL 2h) — implementar retry |
| Subdomínio não resolve | DNS wildcard não propagou | Aguardar propagação (até 48h) — testar com `dig` |
| Imagem não carrega no cardápio | URL do Supabase Storage expirou (signed URL) | Usar URLs públicas para imagens de cardápio (bucket público) |
| RLS bloqueia leitura pública | Policy incorreta para SELECT sem auth | Revisar policy de leitura pública de pratos |
| MP retorna erro 400 ao criar preferência | `unit_price` não é número ou tem mais de 2 casas decimais | Sempre usar `Math.round(preco * 100) / 100` |
| Supabase Realtime não atualiza | Channel não subscrito ou filtro errado | Verificar se `NEXT_PUBLIC_SUPABASE_URL` está correto e Realtime está ativo no projeto |
| Som não toca no admin | Browser bloqueou autoplay | Exibir botão "Ativar som" — tocar apenas após interação do usuário |
| Carrinho some ao recarregar | Zustand sem persistência | Adicionar `persist` middleware do Zustand com `localStorage` |
| Mensagem não chega no grupo All In (V1) | ID do grupo incorreto ou Evolution API offline | Verificar `WHATSAPP_GRUPO_ALLIN_ID` — abrir grupo no WhatsApp Web e extrair ID via API |
| Mensagem chega mas sem formatação | Evolution API não suportando markdown | Usar `*texto*` para negrito — compatível com WhatsApp nativo |

---

*Este documento deve ser atualizado antes de qualquer mudança arquitetural. Versionar junto com o código.*