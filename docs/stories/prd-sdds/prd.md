# PRD — All In Cardápio Digital
**Versão:** 1.0  
**Data:** Maio 2026  
**Autor:** Glauber (All In)  
**Status:** Em revisão

---

## 1. Visão Geral

### O que é
All In Cardápio é um produto SaaS da All In que entrega cardápios digitais bonitos, personalizados e funcionais para restaurantes brasileiros — com pedido online integrado a pagamento (Mercado Pago) e painel de gestão para o dono do estabelecimento.

### Por que existe
Restaurantes perdem vendas por não terem presença digital profissional. Soluções como iFood cobram comissão por pedido e tiram o controle do relacionamento com o cliente. A All In entrega um cardápio próprio do restaurante, sem comissão por pedido, com a cara do estabelecimento e integrado à estrutura de IA da All In.

### Quem usa
- **Cliente final (consumidor):** acessa o cardápio pelo celular, monta o pedido e paga online
- **Dono do restaurante (admin):** gerencia cardápio, acompanha pedidos e configura o estabelecimento
- **All In (operador):** usa como demo no pitch de vendas e onboarda novos clientes

### Posicionamento
> "Seu restaurante com cardápio digital profissional, pedido online e painel de gestão — sem comissão por pedido."

---

## 2. Estratégia de Produto

### Fases de evolução

| Fase | Entrega | Objetivo |
|---|---|---|
| **V1 — Demo** | Cardápio estático hardcoded, visualmente impecável | Usar no pitch. Mostrar para restaurantes o que eles teriam. |
| **V2 — SaaS Básico** | Dashboard admin + Supabase + cardápio dinâmico por restaurante | Onboarding do primeiro cliente pagante |
| **V3 — Pedidos + Pagamento** | Carrinho + Mercado Pago + painel de pedidos em tempo real | Produto completo e escalável |

Este PRD cobre as 3 fases com foco na execução sequencial — **começar pela V1 e escalar.**

---

## 3. Tech Stack

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SEO nativo, rotas dinâmicas, Vercel deploy trivial |
| Estilização | Tailwind CSS | Velocidade, responsividade, consistência |
| Backend (V2+) | Next.js API Routes | Sem servidor separado, tudo no mesmo projeto |
| Banco de dados (V2+) | Supabase (PostgreSQL) | Já familiar no ecossistema do Glauber |
| Autenticação (V2+) | Supabase Auth | Login do admin do restaurante |
| Pagamento (V3) | Mercado Pago Checkout Pro | Maior adoção no Brasil |
| Storage de imagens | Supabase Storage | Fotos dos pratos |
| Deploy | Vercel | Free tier, preview por branch, domínio customizado |
| Domínio (V2+) | `[slug].allinrestaurantes.com.br` | Subdomínio por restaurante via Vercel wildcard |

---

## 4. Arquitetura de URLs

```
allinrestaurantes.com.br              → Landing page da All In (fora do escopo deste PRD)
demo.allinrestaurantes.com.br         → Demo estática (V1) para pitch
[slug].allinrestaurantes.com.br       → Cardápio público de cada restaurante (V2+)
[slug].allinrestaurantes.com.br/admin → Dashboard do dono do restaurante (V2+)
```

**Exemplo real:**
```
pizzariadonajulia.allinrestaurantes.com.br        → cardápio público
pizzariadonajulia.allinrestaurantes.com.br/admin  → painel do dono
```

---

## 5. Estrutura do Projeto (Next.js)

```
allin-cardapio/
├── app/
│   ├── [slug]/                    # Cardápio público por restaurante
│   │   ├── page.tsx               # Página principal do cardápio
│   │   └── layout.tsx             # Meta tags dinâmicas por restaurante
│   ├── [slug]/admin/              # Dashboard do restaurante
│   │   ├── page.tsx               # Overview / pedidos em tempo real
│   │   ├── cardapio/page.tsx      # Gestão do cardápio
│   │   └── configuracoes/page.tsx # Configurações do restaurante
│   ├── api/
│   │   ├── pedidos/route.ts       # CRUD de pedidos
│   │   ├── pratos/route.ts        # CRUD de pratos
│   │   └── pagamento/route.ts     # Webhook Mercado Pago
│   └── layout.tsx
├── components/
│   ├── cardapio/                  # Componentes do cardápio público
│   │   ├── Header.tsx
│   │   ├── CategoriaNav.tsx
│   │   ├── PratoCard.tsx
│   │   ├── PratoModal.tsx
│   │   ├── Carrinho.tsx
│   │   └── CheckoutModal.tsx
│   ├── admin/                     # Componentes do dashboard
│   │   ├── Sidebar.tsx
│   │   ├── PedidoCard.tsx
│   │   ├── PratoForm.tsx
│   │   └── ConfigForm.tsx
│   └── ui/                        # Componentes genéricos (botões, inputs, modais)
├── lib/
│   ├── supabase.ts                # Client Supabase
│   ├── mercadopago.ts             # SDK Mercado Pago
│   └── utils.ts
├── data/
│   └── demo-restaurante.ts        # Dados hardcoded para V1
├── public/
│   └── demo/                      # Imagens da demo
└── middleware.ts                  # Roteamento por subdomínio (V2+)
```

---

## 6. Banco de Dados (V2+ — Supabase)

### Tabelas

#### `restaurantes`
```sql
id              uuid PRIMARY KEY
slug            text UNIQUE NOT NULL       -- ex: pizzariadonajulia
nome            text NOT NULL
descricao       text
logo_url        text
cor_primaria    text DEFAULT '#E85D04'     -- personalizável
cor_secundaria  text DEFAULT '#F48C06'
whatsapp        text
horario         text                       -- ex: "Ter–Dom · 18h–23h"
endereco        text
pedido_minimo   numeric DEFAULT 0
taxa_entrega    numeric DEFAULT 0
ativo           boolean DEFAULT true
criado_em       timestamptz DEFAULT now()
```

#### `categorias`
```sql
id              uuid PRIMARY KEY
restaurante_id  uuid REFERENCES restaurantes(id)
nome            text NOT NULL
ordem           int DEFAULT 0
ativo           boolean DEFAULT true
```

#### `pratos`
```sql
id              uuid PRIMARY KEY
restaurante_id  uuid REFERENCES restaurantes(id)
categoria_id    uuid REFERENCES categorias(id)
nome            text NOT NULL
descricao       text
ingredientes    text
preco           numeric NOT NULL
foto_url        text
badge           text                       -- ex: "Chef Sugere", "Novo", "Especial"
destaque        boolean DEFAULT false      -- card featured (largo)
disponivel      boolean DEFAULT true
ordem           int DEFAULT 0
criado_em       timestamptz DEFAULT now()
```

#### `pedidos`
```sql
id              uuid PRIMARY KEY
restaurante_id  uuid REFERENCES restaurantes(id)
numero          serial                     -- número amigável ex: #042
cliente_nome    text
cliente_tel     text
itens           jsonb NOT NULL             -- snapshot dos pratos no momento do pedido
total           numeric NOT NULL
status          text DEFAULT 'novo'        -- novo | preparando | pronto | entregue | cancelado
pagamento_id    text                       -- ID do Mercado Pago
pagamento_status text DEFAULT 'pendente'  -- pendente | aprovado | rejeitado
tipo_entrega    text DEFAULT 'retirada'   -- retirada | delivery
endereco_entrega text
criado_em       timestamptz DEFAULT now()
atualizado_em   timestamptz DEFAULT now()
```

#### `admins`
```sql
id              uuid PRIMARY KEY REFERENCES auth.users(id)
restaurante_id  uuid REFERENCES restaurantes(id)
nome            text
```

---

## 7. Módulos do Produto

---

### Módulo 1 — Cardápio Público (cliente final)

**Quem usa:** consumidor final no celular ou desktop

#### Tela principal
- Header sticky com logo, nome, horário e botão do carrinho com contador
- Hero com foto de capa (ou gradiente com cor primária do restaurante), nome e informações rápidas
- Barra de categorias em scroll horizontal, sticky abaixo do header
- Seções por categoria com grid de cards de pratos
- Card destaque (featured) — 1 prato por seção ocupa a largura toda

#### Card de prato
- Foto, nome, descrição curta, preço, badge opcional
- Botão `+` para adicionar direto ao carrinho
- Click no card abre modal de detalhe

#### Modal de detalhe do prato
- Foto grande, nome, descrição completa, ingredientes
- Seletor de quantidade
- Preço atualizado por quantidade
- Botão "Adicionar ao pedido"

#### Carrinho
- Painel lateral ou bottom sheet (mobile)
- Lista de itens com quantidade e subtotal
- Campo nome do cliente e telefone
- Seleção: Retirar no local / Delivery (se habilitado)
- Se delivery: campo de endereço
- Resumo: subtotal, taxa de entrega, total
- Botão "Ir para pagamento"

#### Checkout e Pagamento
- Integração com Mercado Pago Checkout Pro
- Redirect para página de pagamento do MP
- Retorno com status (aprovado / rejeitado)
- Tela de confirmação: "Pedido #042 recebido! Acompanhe pelo WhatsApp."
- Notificação via webhook → atualiza status no banco → restaurante vê em tempo real

---

### Módulo 2 — Dashboard Admin (dono do restaurante)

**Quem usa:** dono ou gerente do restaurante

**Acesso:** `[slug].allinrestaurantes.com.br/admin`  
**Auth:** login com email/senha via Supabase Auth

#### 2.1 — Pedidos em Tempo Real (página inicial do admin)

- Feed de pedidos em tempo real via Supabase Realtime
- Cada pedido exibe: número, hora, itens, total, status atual
- Botões de ação por pedido: `Confirmar → Preparando → Pronto → Entregue`
- Filtro por status: Todos / Novos / Em preparo / Prontos / Entregues
- Som de notificação ao chegar novo pedido (configurável)
- Histórico dos últimos 30 dias com busca

#### 2.2 — Gestão do Cardápio

**Categorias:**
- Criar, renomear, reordenar (drag-and-drop), ativar/desativar

**Pratos:**
- Formulário: nome, descrição, ingredientes, preço, categoria, badge, foto (upload)
- Toggle de disponibilidade (ativar/pausar sem excluir)
- Marcar como destaque (aparece como card featured)
- Reordenar pratos dentro da categoria

#### 2.3 — Configurações do Restaurante

- Nome, descrição, logo (upload)
- Cor primária e secundária (color picker — personaliza o cardápio)
- Horário de funcionamento
- WhatsApp de contato
- Endereço
- Pedido mínimo
- Taxa de entrega (ou "entrega grátis")
- Habilitar/desabilitar delivery
- Preview ao vivo: vê como o cardápio ficará antes de salvar

---

### Módulo 3 — Personalização por Restaurante (V2+)

Cada restaurante tem seu cardápio com:
- Cores primária e secundária configuráveis
- Logo próprio
- Hero com foto de capa ou gradiente automático
- URL própria via subdomínio
- Meta tags dinâmicas (nome do restaurante, descrição, OG image)

---

## 8. Design System

### Paleta base (template — sobrescrita por configuração do restaurante)
```
--primary:     #E85D04   (laranja quente)
--primary-dark:#C44D00
--secondary:   #F48C06   (âmbar)
--bg:          #FAFAF8   (branco quente — modo claro padrão)
--surface:     #FFFFFF
--card:        #FFFFFF
--text:        #1A1A1A
--muted:       #6B6B6B
--border:      #E5E5E5
```

### Tipografia
- **Display / Títulos:** Fraunces (serif elegante, substituto do Cormorant)
- **Body / UI:** Inter (legível, moderno, padrão web)

### Princípios visuais
- Mobile-first obrigatório (>70% do acesso será pelo celular)
- Cards com sombra leve, sem bordas pesadas
- Fotos dos pratos em aspect ratio 4:3
- Botão CTA sempre em cor primária do restaurante
- Espaçamento base: 8px grid
- Raio de borda: 12px nos cards, 8px nos botões

---

## 9. Fluxos Principais

### Fluxo do consumidor (V3)
```
Acessa URL → Vê cardápio → Clica em prato → Abre modal
→ Adiciona ao carrinho → Abre carrinho → Preenche dados
→ Clica "Ir para pagamento" → Mercado Pago
→ Pagamento aprovado → Tela de confirmação
→ Restaurante recebe pedido no admin em tempo real
```

### Fluxo do dono (novo pedido)
```
Notificação sonora → Vê pedido novo no feed
→ Clica "Confirmar" → Status vira "Preparando"
→ Clica "Pronto" → Cliente recebe status (futuro: WhatsApp)
→ Clica "Entregue" → Pedido arquivado
```

### Fluxo de onboarding (All In onboarda novo cliente)
```
All In cria restaurante no Supabase → Define slug
→ Envia credenciais de acesso ao admin → Restaurante configura
→ URL ativa → Cardápio no ar
```

---

## 10. Roadmap de Entregas

### V1 — Demo Estática (Semana 1–2)
**Objetivo:** ter algo impecável para mostrar no pitch

- [ ] Setup Next.js + Tailwind
- [ ] Dados hardcoded em `data/demo-restaurante.ts`
- [ ] Componente `Header` com logo, horário e carrinho
- [ ] Componente `CategoriaNav` sticky com scroll
- [ ] Componente `PratoCard` (normal + featured)
- [ ] Componente `PratoModal` com seletor de quantidade
- [ ] Componente `Carrinho` com lista de itens e total
- [ ] Toast de feedback ao adicionar item
- [ ] Layout responsivo mobile-first
- [ ] Deploy na Vercel em `demo.allinrestaurantes.com.br`

**Critério de sucesso:** qualquer pessoa que acessar no celular consegue navegar, adicionar itens e ver o total sem precisar de instrução.

---

### V2 — SaaS Básico (Semana 3–6)
**Objetivo:** primeiro cliente real no ar

- [ ] Setup Supabase (tabelas conforme seção 6)
- [ ] Supabase Auth para login do admin
- [ ] API Routes: restaurantes, categorias, pratos
- [ ] Dashboard admin: gestão de cardápio
- [ ] Dashboard admin: configurações do restaurante
- [ ] Preview ao vivo no admin
- [ ] Middleware Next.js para roteamento por subdomínio
- [ ] Wildcard DNS na Vercel
- [ ] Upload de imagens para Supabase Storage
- [ ] Color picker funcional (personalização visual)

**Critério de sucesso:** All In consegue onboar um restaurante em menos de 30 minutos e o cardápio fica no ar com a cara do estabelecimento.

---

### V3 — Pedidos + Pagamento (Semana 7–10)
**Objetivo:** produto completo gerando receita

- [ ] Componente `Carrinho` completo com campos do cliente
- [ ] Componente `CheckoutModal` com resumo
- [ ] Integração Mercado Pago Checkout Pro
- [ ] Webhook de confirmação de pagamento
- [ ] Tabela `pedidos` no Supabase
- [ ] Dashboard admin: feed de pedidos em tempo real (Supabase Realtime)
- [ ] Ações de status por pedido
- [ ] Notificação sonora de novo pedido
- [ ] Histórico de pedidos com filtros
- [ ] Tela de confirmação para o consumidor

**Critério de sucesso:** pedido feito pelo consumidor aparece no painel do restaurante em menos de 3 segundos. Pagamento aprovado antes de exibir confirmação.

---

## 11. Fora de Escopo (por enquanto)

- App nativo (iOS/Android)
- Integração com iFood/Rappi
- Sistema de fidelidade / cupons
- Múltiplos admins por restaurante
- Relatórios financeiros avançados
- Notificação automática por WhatsApp ao cliente (pode vir na V4 via All In IA)
- Cardápio em inglês / i18n

---

## 12. Perguntas Abertas

| # | Questão | Impacto |
|---|---|---|
| 1 | Haverá plano de preços para o SaaS? (mensal fixo, por pedido, etc.) | Modelo de negócio |
| 2 | All In fará o onboarding manualmente ou terá self-service? | Complexidade do admin |
| 3 | Delivery próprio ou só retirada na V3? | Fluxo de checkout |
| 4 | O restaurante quer receber notificação no WhatsApp de novo pedido? | Integração com All In IA |
| 5 | Domínio `allinrestaurantes.com.br` já existe ou precisa registrar? | Infra / DNS |

---

## 13. Critérios de Sucesso Globais

- Cardápio carrega em menos de 2s no celular em 4G
- Score Lighthouse mobile > 85
- Zero comissão por pedido cobrada do restaurante
- Onboarding de novo cliente em menos de 30 minutos (V2)
- Pedido aparece no admin em menos de 3 segundos após pagamento (V3)