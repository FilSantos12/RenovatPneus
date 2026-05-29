# RenovatPneus — Guia para Claude Code

## O que é este projeto

Sistema web de gestão de estoque para a empresa **Renovat Pneus**. Frontend puro (sem backend) com dados em mock, projetado para uso em rede interna. Foco em simplicidade visual para usuários sem experiência com sistemas digitais.

**URL de produção:** `https://filsantos12.github.io/RenovatPneus/`
**Repositório:** `https://github.com/FilSantos12/RenovatPneus`

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Estilos | Tailwind CSS v4 |
| Roteamento | React Router v7 — **`createHashRouter`** |
| Componentes UI | Radix UI + shadcn/ui (`src/app/components/ui/`) |
| Gráficos | Recharts |
| Notificações | Sonner (toast) |
| Formulários | React Hook Form |
| Animações | Motion (Framer Motion) |
| Ícones | Lucide React |

---

## Estrutura de arquivos

```
src/
├── main.tsx                        # Ponto de entrada
├── styles/
│   ├── index.css                   # Importa fonts, tailwind e theme
│   ├── fonts.css                   # Google Fonts (Barlow Condensed + DM Sans)
│   ├── tailwind.css                # Diretiva @import "tailwindcss"
│   ├── theme.css                   # Variáveis CSS da paleta + tipografia
│   └── globals.css
└── app/
    ├── App.tsx                     # Raiz: AuthProvider + RouterProvider + Toaster
    ├── routes.tsx                  # Definição das rotas (createHashRouter)
    ├── types/index.ts              # Tipos: User, Product, Movement, Service, Sale, SaleItem, SaleService
    ├── data/mockData.ts            # Dados mock: mockProducts[], mockMovements[], mockServices[], mockSales[]
    ├── contexts/
    │   └── AuthContext.tsx         # Auth mock com localStorage
    ├── components/
    │   ├── Layout.tsx              # Wrapper flex: Sidebar + (MobileHeader + main)
    │   ├── Sidebar.tsx             # Sidebar desktop (sticky, hidden em mobile)
    │   ├── MobileHeader.tsx        # Header fixo mobile (lg:hidden)
    │   ├── MobileDrawer.tsx        # Drawer de navegação mobile
    │   ├── ProtectedRoute.tsx      # Guard: redireciona se não autenticado ou sem role
    │   └── ui/                     # Componentes shadcn/ui (não editar diretamente)
    └── pages/
        ├── Login.tsx
        ├── Dashboard.tsx
        ├── Estoque.tsx
        ├── Entrada.tsx
        ├── Saida.tsx
        ├── Scanner.tsx
        ├── Etiquetas.tsx
        ├── Historico.tsx
        ├── Financas.tsx            # Relatórios financeiros (ADM)
        ├── Servicos.tsx            # Cadastro e gestão de serviços (ADM + OPERADOR)
        ├── Usuarios.tsx            # Apenas ADM
        └── AcessoNegado.tsx
```

---

## Roteamento

Usa **`createHashRouter`** (URLs com `#`). Isso é obrigatório para o GitHub Pages funcionar — não trocar para `createBrowserRouter`.

| Rota | Componente | Proteção |
|---|---|---|
| `/` | Login | — |
| `/dashboard` | Dashboard | Autenticado |
| `/scanner` | Scanner | Autenticado |
| `/estoque` | Estoque | Autenticado |
| `/entrada` | Entrada | Autenticado |
| `/saida` | Saida | Autenticado |
| `/etiquetas` | Etiquetas | Autenticado |
| `/historico` | Historico | Autenticado |
| `/servicos` | Servicos | Autenticado |
| `/financas` | Financas | Autenticado (visível na sidebar só para ADM) |
| `/usuarios` | Usuarios | `requiredRole="ADM"` |
| `/acesso-negado` | AcessoNegado | — |

`ProtectedRoute` sem `requiredRole` redireciona para `/` se não autenticado. Com `requiredRole`, redireciona para `/acesso-negado` se o role não bate.

---

## Autenticação

Mock em `AuthContext.tsx` — sem backend. Sessão persiste via `localStorage` (chave `renovat_user`).

**Credenciais:**
- `admin` / `admin123` → role `ADM`
- `joao` / `joao123` → role `OPERADOR`

**Papéis:**
- `ADM` — acesso total (incluindo `/usuarios`, `/financas` e exportações)
- `OPERADOR` — operações básicas; histórico restrito às próprias ações; acesso a `/servicos`

---

## Dados mock

`src/app/data/mockData.ts` exporta:
- `mockProducts: Product[]` — 8 pneus de marcas variadas
- `mockMovements: Movement[]` — 5 movimentações de exemplo
- `mockServices: Service[]` — 6 serviços (Montagem, Balanceamento, Alinhamento, Rotação, Reparo, Calibragem)
- `mockSales: Sale[]` — 5 vendas completas com itens, serviços, métodos de pagamento e operadores

Qualquer nova feature que precise de persistência deve ou estender esses arrays em memória ou integrar Supabase (próximo passo natural do projeto).

---

## Tipos principais (types/index.ts)

```typescript
// Pré-existentes
User, Product, Movement, UserRole

// Adicionados com Serviços e Finanças
Service       // id, name, description, price, duration (min), active
Sale          // id, date, client, items[], services[], subtotal, discount, total, operator, paymentMethod, status
SaleItem      // productId, productName, quantity, unitPrice, total
SaleService   // serviceId, serviceName, quantity, unitPrice, total
```

`paymentMethod`: `'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX'`
`Sale.status`: `'CONCLUIDA' | 'CANCELADA'`

---

## Página Finanças (`/financas`)

Acesso restrito a `ADM` (filtrado na sidebar; rota sem `requiredRole` no `ProtectedRoute`).

**Funcionalidades:**
- Filtros de período: Hoje / 7 dias / 30 dias / Tudo
- Cards de resumo: Receita Total, Total de Vendas, Ticket Médio, Produtos vs Serviços
- Bar Chart (Recharts): receita dos últimos 7 dias
- Pie Chart (Recharts): distribuição por forma de pagamento
- Tabela de vendas recentes com cliente, itens, serviços, método de pagamento, operador e total
- Botão de exportação (mock)

---

## Página Serviços (`/servicos`)

Acessível para `ADM` e `OPERADOR`.

**Funcionalidades:**
- Campo de busca por nome ou descrição
- Grid responsivo: 1 col mobile / 2 col tablet / 3 col desktop
- Cards por serviço: nome, descrição, preço, duração, badge ativo/inativo
- Botões Editar e Excluir por card
- Modal criar/editar: nome, descrição, preço (R$), duração (min), checkbox ativo
- Toast notifications ao salvar/excluir

---

## Navegação (Sidebar + MobileDrawer)

Ambos usam o mesmo array `menuItems` filtrado por `role`:

| Item | Rota | Roles |
|---|---|---|
| Dashboard | `/dashboard` | ADM, OPERADOR |
| Escanear | `/scanner` | ADM, OPERADOR |
| Estoque | `/estoque` | ADM, OPERADOR |
| Entrada | `/entrada` | ADM, OPERADOR |
| Saída | `/saida` | ADM, OPERADOR |
| Serviços | `/servicos` | ADM, OPERADOR |
| Etiquetas | `/etiquetas` | ADM, OPERADOR |
| Histórico | `/historico` | ADM, OPERADOR |
| Finanças | `/financas` | ADM |
| Usuários | `/usuarios` | ADM |

---

## Design system

### Paleta (variáveis em `theme.css`)
| Variável | Hex | Uso |
|---|---|---|
| `--renovat-black` | `#111111` | Cor primária, sidebar, textos |
| `--renovat-orange` | `#F97316` | Ações, destaques, ativo no menu |
| `--renovat-gray-light` | `#F5F5F5` | Fundo geral |
| `--renovat-gray-dark` | `#2D2D2D` | Textos secundários |
| `--renovat-success` | `#22C55E` | Entradas, estoque OK, preços de serviços |
| `--renovat-danger` | `#EF4444` | Saídas, estoque zerado |
| `--renovat-warning` | `#FBBF24` | Estoque baixo |

### Tipografia
- **Títulos:** `font-['Barlow_Condensed']` bold
- **Corpo:** `DM Sans` (aplicado via `font-family: var(--font-body)` no `body`)

### Padrões de componentes
- Botões: `border-radius: 12px`, altura mínima `48px`
- Cards: `border-radius: 16px`, padding `24px`
- Todos os elementos interativos: mínimo `48x48px` de área de toque

---

## Layout responsivo

`Layout.tsx` usa `flex` no container raiz:

```
div.flex.min-h-screen
├── Sidebar          ← hidden em mobile, sticky desktop
└── div.flex-1
    ├── MobileHeader ← fixed, lg:hidden
    └── main         ← pt-16 lg:pt-0 (compensa o header fixo mobile)
```

| Breakpoint | Comportamento |
|---|---|
| `< 1024px` | MobileHeader + MobileDrawer (hamburguer) |
| `≥ 1024px` | Sidebar expandida, MobileHeader oculto |

A Sidebar é **sempre expandida** em desktop — o auto-collapse automático foi removido intencionalmente.

---

## Deploy (GitHub Pages)

O deploy é **automático** via GitHub Actions a cada push em `master`.

**Arquivo:** `.github/workflows/deploy.yml`
- Instala dependências com `npm ci`
- Executa `npm run build`
- Publica o `dist/` via `actions/deploy-pages`

**Configuração crítica no `vite.config.ts`:**
```ts
base: '/RenovatPneus/'
```
Não remover — sem isso os assets quebram no GitHub Pages.

**Por que `createHashRouter`:**
O GitHub Pages não suporta reescrita de URL server-side. O `createBrowserRouter` causaria 404 em qualquer rota além da raiz. O `createHashRouter` resolve isso com `/#/rota`.

---

## Comandos

```bash
npm run dev      # Dev server (localhost:5173)
npm run build    # Build para dist/
```
