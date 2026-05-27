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
│   └── theme.css                   # Variáveis CSS da paleta + tipografia
└── app/
    ├── App.tsx                     # Raiz: AuthProvider + RouterProvider + Toaster
    ├── routes.tsx                  # Definição das rotas (createHashRouter)
    ├── types/index.ts              # Tipos: User, Product, Movement, UserRole
    ├── data/mockData.ts            # Dados mock: mockProducts[], mockMovements[]
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
- `ADM` — acesso total (incluindo `/usuarios` e exportações)
- `OPERADOR` — operações básicas; histórico restrito às próprias ações

---

## Dados mock

`src/app/data/mockData.ts` exporta:
- `mockProducts: Product[]` — 8 pneus de marcas variadas
- `mockMovements: Movement[]` — 5 movimentações de exemplo

Qualquer nova feature que precise de persistência deve ou estender esses arrays em memória ou integrar Supabase (próximo passo natural do projeto).

---

## Design system

### Paleta (variáveis em `theme.css`)
| Variável | Hex | Uso |
|---|---|---|
| `--renovat-black` | `#111111` | Cor primária, sidebar, textos |
| `--renovat-orange` | `#F97316` | Ações, destaques, ativo no menu |
| `--renovat-gray-light` | `#F5F5F5` | Fundo geral |
| `--renovat-gray-dark` | `#2D2D2D` | Textos secundários |
| `--renovat-success` | `#22C55E` | Entradas, estoque OK |
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
