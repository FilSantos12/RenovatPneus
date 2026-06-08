# RenovatPneus — Guia para Claude Code

## O que é este projeto

Sistema web de gestão de estoque de pneus para a **Renovat Pneus**. Projetado para uso em rede interna (localhost): um PC Windows atua como servidor e 2-3 dispositivos na mesma rede Wi-Fi acessam via navegador.

**Repositório:** `https://github.com/FilSantos12/RenovatPneus`

---

## Estrutura do monorepo

```
RenovatPneus/
├── frontend/          # React 18 + TypeScript + Tailwind v4
├── backend/           # Laravel 11 + PHP 8.2 + Sanctum
├── scripts/           # Scripts BAT de instalação e manutenção Windows
├── installer/         # Inno Setup (.iss) → gera RenovatPneus-Setup.exe
└── CLAUDE.md
```

---

## Stack

### Frontend (`frontend/`)

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Estilos | Tailwind CSS v4 |
| Roteamento | React Router v7 — `createBrowserRouter` |
| HTTP | Axios — `withCredentials: true` (Sanctum cookies) |
| Cache/estado | TanStack React Query v5 |
| Componentes UI | Radix UI + shadcn/ui (`src/app/components/ui/`) |
| Gráficos | Recharts |
| Notificações | Sonner (toast) |
| Formulários | React Hook Form |
| Animações | Motion (Framer Motion) |
| Ícones | Lucide React |
| Scanner câmera | react-zxing v3 |
| Código de barras | jsbarcode |
| Impressão | react-to-print v3 |

### Backend (`backend/`)

| Camada | Tecnologia |
|---|---|
| Framework | Laravel 11 |
| PHP | 8.2 (produção via Laragon) / 8.5 (dev local) |
| Auth | Laravel Sanctum — SPA mode (cookies httpOnly) |
| DB dev | SQLite (`backend/database/database.sqlite`) |
| DB prod | MySQL 8 via Laragon |
| Deploy | `php artisan serve` via NSSM (serviço Windows) |

---

## Estrutura de arquivos — Frontend

```
frontend/
├── .env                        # VITE_API_URL= (vazio = usa proxy Vite)
├── .env.example
├── vite.config.ts              # proxy /api e /sanctum → localhost:8000, host 0.0.0.0
├── package.json
└── src/
    ├── main.tsx                # QueryClientProvider + App + ReactQueryDevtools
    ├── lib/
    │   ├── axios.ts            # instância Axios, interceptor 401
    │   ├── queryClient.ts      # QueryClient (staleTime 5min, retry 1)
    │   ├── errors.ts           # extractValidationErrors, getFirstError, getErrorMessage
    │   ├── barcode.ts          # generateBarcodeSVG via jsbarcode
    │   ├── export.ts           # exportHistoricoToExcel(), exportSaleToExcel(), exportHistoricoToPDF()
    │   └── saleStatus.ts       # saleStatusLabel(status, paymentMethod) — fonte única do label de status de venda
    ├── services/
    │   ├── auth.service.ts     # login (→ data.user), logout, me (→ data.data)
    │   ├── product.service.ts  # parseProduct(), getNextBarcode() — normaliza decimais para Number
    │   ├── movement.service.ts
    │   ├── sale.service.ts     # parseSale() normaliza total/unit_price/subtotal para Number
    │   ├── service.service.ts  # parseService() normaliza price para Number
    │   ├── user.service.ts
    │   ├── dashboard.service.ts
    │   └── finance.service.ts  # getSummary(period) → FinanceSummary; period: today|month|year
    ├── hooks/
    │   ├── useProducts.ts      # inclui useNextBarcode() (staleTime:0, gcTime:0)
    │   ├── useMovements.ts
    │   ├── useSales.ts
    │   ├── useServices.ts
    │   ├── useUsers.ts
    │   ├── useDashboard.ts
    │   ├── useFinance.ts       # useFinanceSummary(period) — staleTime 2min
    │   └── useBarcodeScan.ts   # captura teclado HID (leitor USB) com buffer + timeout
    ├── styles/
    │   ├── index.css
    │   ├── fonts.css           # Google Fonts (Barlow Condensed + DM Sans)
    │   ├── tailwind.css
    │   └── theme.css           # variáveis CSS da paleta
    └── app/
        ├── App.tsx             # AuthProvider + RouterProvider + Toaster
        ├── routes.tsx          # createBrowserRouter com rotas protegidas
        ├── types/index.ts      # tipos alinhados com API (ver seção de tipos)
        ├── data/mockData.ts    # mock preservado mas não usado nas páginas
        ├── contexts/
        │   └── AuthContext.tsx # Sanctum real — chama /api/me no mount, sem localStorage
        ├── components/
        │   ├── Layout.tsx
        │   ├── Sidebar.tsx         # ordem: Dashboard, Finanças, Estoque, Entrada, Venda, Serviços, Etiquetas, Escanear, Histórico, Usuários
        │   ├── MobileHeader.tsx
        │   ├── MobileDrawer.tsx    # mesma ordem do Sidebar.tsx
        │   ├── ProtectedRoute.tsx  # exibe spinner enquanto isLoading=true
        │   ├── BarcodeScanner/
        │   │   └── BarcodeScanner.tsx  # modal câmera (react-zxing) + USB/HID
        │   ├── Labels/
        │   │   └── LabelItem.tsx       # etiqueta 50×30mm com código de barras real
        │   ├── Products/
        │   │   └── ProductFormModal.tsx  # modal único criar/editar produto + scanner + barcode preview
        │   │   └── (view inline em Estoque.tsx)  # modal somente-leitura com detalhes do produto
        │   ├── Historico/
        │   │   └── HistoricoDetalheModal.tsx  # modal detalhe entrada/venda; botão "Marcar como pago" (só fiado pendente); exporta tipo HistoricoItem
        │   └── ui/                     # shadcn/ui — não editar diretamente
        └── pages/
            ├── Login.tsx           # navega via useEffect após isAuthenticated=true
            ├── Dashboard.tsx       # 5 cards clicáveis, gráfico 7 dias (dados do backend, BRT-aware), atividades unificadas (movements + sales)
            ├── Estoque.tsx         # CRUD completo: visualizar, cadastro, edição, exclusão (ADM), etiqueta
            ├── Entrada.tsx         # usa useCreateMovement(), BarcodeScanner integrado
            ├── Saida.tsx           # usa useCreateSale(), BarcodeScanner integrado
            ├── Scanner.tsx         # usa useProducts() + useCreateMovement()
            ├── Etiquetas.tsx       # LabelsPage: preview, A4/térmica, react-to-print v3
            ├── Historico.tsx       # entradas + vendas unificadas; filtros tipo/data/busca; modal detalhe; export Excel/PDF
            ├── Financas.tsx        # useFinanceSummary(period); cards receita/custo/lucro; gráficos Recharts; apenas ADM
            ├── Servicos.tsx        # usa useServices(), CRUD completo
            ├── Usuarios.tsx        # usa useUsers(), useToggleUserActive() — apenas ADM
            └── AcessoNegado.tsx
```

---

## Estrutura de arquivos — Backend

```
backend/
├── app/
│   ├── Enums/
│   │   ├── UserRole.php         # adm | operador
│   │   ├── MovementType.php     # entrada | saida
│   │   ├── PaymentMethod.php    # dinheiro | cartao_credito | cartao_debito | pix | fiado
│   │   └── SaleStatus.php       # pendente | pago | cancelado
│   ├── Exceptions/
│   │   └── InsufficientStockException.php  # render() → 422
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── Controller.php       # base: success(), deleted()
│   │   │   ├── AuthController.php   # login → { user, message }, logout, me
│   │   │   ├── DashboardController.php
│   │   │   ├── FinanceController.php  # GET /finance/summary?period= → receita/custo/lucro/série/fiado
│   │   │   ├── ProductController.php
│   │   │   ├── MovementController.php
│   │   │   ├── ServiceController.php
│   │   │   ├── SaleController.php
│   │   │   └── UserController.php
│   │   ├── Middleware/
│   │   │   └── CheckRole.php        # alias 'role' em bootstrap/app.php
│   │   ├── Requests/
│   │   │   ├── Auth/LoginRequest.php
│   │   │   ├── User/StoreUserRequest.php
│   │   │   ├── User/UpdateUserRequest.php
│   │   │   ├── Product/StoreProductRequest.php
│   │   │   ├── Product/UpdateProductRequest.php
│   │   │   ├── Movement/StoreMovementRequest.php
│   │   │   ├── Service/StoreServiceRequest.php
│   │   │   ├── Service/UpdateServiceRequest.php
│   │   │   ├── Sale/StoreSaleRequest.php
│   │   │   └── Sale/UpdateSaleStatusRequest.php
│   │   └── Resources/
│   │       ├── UserResource.php + UserCollection.php
│   │       ├── ProductResource.php + ProductCollection.php
│   │       ├── MovementResource.php + MovementCollection.php
│   │       ├── ServiceResource.php + ServiceCollection.php
│   │       └── SaleResource.php + SaleCollection.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── Movement.php
│   │   ├── Service.php
│   │   ├── Sale.php
│   │   ├── SaleItem.php
│   │   ├── SaleService.php
│   │   └── BarcodeSequence.php  # generateNext() atômico (lockForUpdate) + peekNext()
│   ├── Policies/
│   │   ├── UserPolicy.php
│   │   ├── ProductPolicy.php
│   │   ├── MovementPolicy.php   # update/delete sempre false — imutável
│   │   ├── ServicePolicy.php
│   │   └── SalePolicy.php
│   └── Services/
│       ├── AuthService.php      # login por username + check active
│       ├── ProductService.php   # store() gera barcode automaticamente se vier vazio
│       ├── MovementService.php  # lockForUpdate() + DB::transaction
│       ├── SaleService.php      # reutiliza MovementService para baixa de estoque; à vista → PAGO+paid_at; fiado → PENDENTE
│       ├── UserService.php
│       └── DashboardService.php  # BRT-aware (Carbon whereBetween); gráfico 7 dias agregado no backend; sales_today usa whereHas('items')
├── database/
│   ├── migrations/              # 13 migrations (+ barcode_sequences + add_price_cost_to_services)
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── UserSeeder.php
│       ├── ProductSeeder.php
│       └── ServiceSeeder.php
├── routes/
│   └── api.php                  # 33 rotas registradas
├── config/
│   ├── app.php                  # business_timezone: env('APP_BUSINESS_TIMEZONE', 'America/Sao_Paulo') — fuso único para queries BRT
│   └── cors.php                 # supports_credentials: true, allowed_origins: FRONTEND_URL + allowed_origins_patterns: subnet 192.168.1.x:5173
└── bootstrap/
    └── app.php                  # statefulApi() + alias 'role'
```

---

## Tipos TypeScript (alinhados com a API)

```typescript
// Roles e enums — sempre lowercase, como o backend retorna
type UserRole     = 'adm' | 'operador'
type MovementType = 'entrada' | 'saida'
type SaleStatus  = 'pendente' | 'pago' | 'cancelado'
type PaymentMethod = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'fiado'

// Campos de produto
Product.name        // nome de exibição (não "description")
Product.barcode     // código de barras obrigatório (string, não opcional)
Product.min_stock   // estoque mínimo (não "minQuantity")
Product.price_sale  // preço de venda
Product.price_cost  // preço de custo (opcional)
Product.low_stock   // boolean calculado pelo backend

// Campos de serviço
Service.price       // preço cobrado ao cliente
Service.price_cost  // custo de execução (opcional, usado no cálculo de Lucro em Finanças)

// Campos de movimentação (objeto aninhado)
Movement.product.name   // não "productName"
Movement.user.name      // não "operator"
Movement.created_at     // não "date"

// Campos de venda
Sale.customer_name      // não "client"
Sale.payment_method     // não "paymentMethod"
Sale.user.name          // operador
Sale.created_at         // não "date"
```

**Decimais:** O Laravel retorna colunas `decimal`/`float` como **string**. Os services normalizam com `Number()` nas funções `parseProduct()`, `parseService()` (normaliza `price` e `price_cost`) e `parseSale()`. Nunca chamar `.toFixed()` diretamente em valores vindos da API sem `Number()`.

**Login:** `AuthController::login` retorna `{ user: {...}, message: "..." }` — o service usa `data.user`. Os demais endpoints usam o padrão `{ data: {...} }` do `JsonResource` — usam `data.data`.

**ProductPayload** (product.service.ts): inclui `quantity?: number` para quantidade inicial no cadastro. O campo `barcode` **não é enviado no payload de criação** — o backend sempre gera via `BarcodeSequence::generateNext()`. `StoreProductRequest` não aceita o campo `barcode`. O modal de cadastro exibe o preview somente-leitura via `GET /api/products/next-barcode` (`peekNext()`), e após salvar exibe o código real gerado com botão "Imprimir etiqueta".

---

## API — Rotas disponíveis (33 total)

| Método | Rota | Auth | Role | Descrição |
|---|---|---|---|---|
| GET | `/api/health` | Não | — | Health check |
| POST | `/api/login` | Não | — | Login por username |
| POST | `/api/logout` | ✅ | — | Logout |
| GET | `/api/me` | ✅ | — | Usuário autenticado |
| GET | `/api/dashboard` | ✅ | — | Resumo do dia |
| GET | `/api/finance/summary` | ✅ | — | Resumo financeiro por período (today\|month\|year) |
| GET/POST | `/api/products` | ✅ | POST: adm | CRUD de produtos |
| GET | `/api/products/next-barcode` | ✅ | adm | Preview do próximo código RNV (peekNext) |
| GET | `/api/products/barcode/{barcode}` | ✅ | — | Busca por código de barras |
| GET/PUT/DELETE | `/api/products/{product}` | ✅ | PUT/DELETE: adm | — |
| GET/POST | `/api/movements` | ✅ | — | Listagem e criação de movimentações |
| GET | `/api/movements/{movement}` | ✅ | — | Sem update/delete (imutável) |
| GET/POST | `/api/services` | ✅ | POST: adm | CRUD de serviços |
| GET/PUT/DELETE | `/api/services/{service}` | ✅ | PUT/DELETE: adm | — |
| GET/POST | `/api/sales` | ✅ | — | CRUD de vendas |
| GET/PUT/DELETE | `/api/sales/{sale}` | ✅ | DELETE: adm | — |
| PATCH | `/api/sales/{sale}/status` | ✅ | — | Atualizar status da venda |
| GET/POST | `/api/users` | ✅ | adm | CRUD de usuários |
| GET/PUT/DELETE | `/api/users/{user}` | ✅ | adm | — |
| PATCH | `/api/users/{user}/toggle-active` | ✅ | adm | Ativar/desativar usuário |

### Arquitetura em camadas

```
Request → Route → Middleware (auth:sanctum, role)
       → Controller (fino, ≤10 linhas/método)
       → FormRequest (valida)
       → Service (regra de negócio, transações)
       → Model → Resource (formata JSON)
```

### Regras de negócio importantes

- **Estoque:** `MovementService` usa `lockForUpdate()` + `DB::transaction` — sem race condition
- **Venda:** `SaleService::store` reutiliza `MovementService` para dar baixa por item
- **Status inicial da venda:** `SaleService::store` — `payment_method=fiado` → `status=PENDENTE, paid_at=null`; qualquer outro método (à vista) → `status=PAGO, paid_at=now()`
- **Quitar fiado:** `PATCH /api/sales/{sale}/status` com `{ status: 'pago' }` → `SaleService::updateStatus` seta `paid_at=now()`. Policy: ADM pode qualquer venda; operador só as próprias
- **Estoque insuficiente:** lança `InsufficientStockException` → resposta 422 automática
- **Movimentação imutável:** `MovementPolicy` retorna `false` para update/delete
- **Usuário desativado:** `AuthService` verifica `active = true` no login
- **Barcode interno:** `BarcodeSequence::generateNext()` usa `lockForUpdate()` — sem duplicatas; `peekNext()` só lê (preview sem reservar)
- **Dashboard timezone:** queries usam `Carbon::now('America/Sao_Paulo')->startOfDay()->setTimezone('UTC')` — fuso centralizado em `config('app.business_timezone')`; NÃO alterar `app.timezone` (armazenamento UTC)
- **Dashboard gráfico:** 7 dias agregados no backend (`DashboardService::getWeeklyChart`) — evita truncamento por paginação da API
- **Dashboard `sales_today`:** usa `whereHas('items')` — conta apenas vendas com produtos; venda exclusiva de serviço não entra neste contador
- **Dashboard `services_today`:** soma `SaleService::whereDate('created_at')->sum('quantity')` — conta todos os serviços executados independente da venda ter produtos
- **FinanceController:** conta todas as vendas não-canceladas (PAGO + PENDENTE) para receita/custo/lucro. Retorna `service_cost` (soma de `Service.price_cost * quantity`). Fórmula: `profit = revenue - cost - service_cost`
- **Fiado alert:** `fiado_count/fiado_total` buscados globalmente (sem filtro de período) — vendas com `payment_method=fiado` e `status=pendente`
- **Label de status:** `saleStatusLabel(status, paymentMethod)` em `src/lib/saleStatus.ts` — fonte única: `cancelado→'cancelado'`, `pago→'pago'`, `pendente+fiado→'fiado'`, `pendente+outro→'pendente'`
- **Histórico unificado:** `HistoricoItem` une movimentos de entrada + vendas; saídas de estoque não aparecem (são redundantes com as vendas)

---

## Autenticação

Login por **username** (não email). Email existe na tabela mas não é usado no login.

**Fluxo Sanctum SPA:**
1. `GET /sanctum/csrf-cookie` — obtém cookie CSRF
2. `POST /api/login` — autentica, cria sessão
3. Todas as requisições subsequentes enviam cookie de sessão automaticamente (`withCredentials: true`)
4. `AuthContext` chama `/api/me` ao montar para restaurar sessão existente
5. Interceptor 401 redireciona para `/` — exceto quando já em `/` (evita loop no mount)

**Credenciais de teste:**

| Username | Senha | Papel |
|---|---|---|
| `admin` | `password` | adm |
| `operador1` | `password` | operador |
| `operador2` | `password` | operador |

**Papéis:**
- `adm` — acesso total (usuários, finanças, exportações)
- `operador` — estoque, movimentações, serviços

---

## Banco de dados — Tabelas

| Tabela | SoftDeletes | Observação |
|---|---|---|
| `users` | ✅ | Campo `username` único; `active` para desativar sem deletar |
| `products` | ✅ | `barcode` único + indexado; nullable no store (gerado se vazio) |
| `movements` | ❌ | Auditoria — nunca apaga |
| `services` | ✅ | Campo `price_cost` nullable — custo de execução, usado no cálculo de lucro em Finanças |
| `sales` | ✅ | |
| `sale_items` | ❌ | Registro financeiro — nunca apaga |
| `sale_services` | ❌ | Registro financeiro — nunca apaga |
| `barcode_sequences` | ❌ | Sempre 1 registro — contador global dos códigos RNV-XXXXXX |

---

## Roteamento (Frontend)

Usa **`createBrowserRouter`**. O Vite dev server serve o `index.html` para todas as rotas em desenvolvimento.

| Rota | Componente | Proteção |
|---|---|---|
| `/` | Login | — |
| `/dashboard` | Dashboard | Autenticado |
| `/financas` | Financas | Autenticado (sidebar: só adm) |
| `/estoque` | Estoque | Autenticado |
| `/entrada` | Entrada | Autenticado |
| `/saida` | Saida | Autenticado (label sidebar: **Venda**) |
| `/servicos` | Servicos | Autenticado |
| `/etiquetas` | Etiquetas | Autenticado |
| `/scanner` | Scanner | Autenticado |
| `/historico` | Historico | Autenticado |
| `/usuarios` | Usuarios | `requiredRole="adm"` |
| `/acesso-negado` | AcessoNegado | — |

---

## Scanner de código de barras

### Modo USB/HID (leitor físico)
O hook `useBarcodeScan` captura teclado com buffer + timeout de 100ms e threshold de velocidade de **50ms** entre teclas — só acumula no buffer se `timeSinceLast < 50ms` ou buffer já iniciado. Isso distingue o leitor USB (muito rápido) de digitação humana. Input oculto com `autoFocus` obrigatório.

### Modo câmera (react-zxing v3)
```typescript
// API v3 — usa result.rawValue; câmera traseira preferida; onError para NotAllowedError/NotFoundError
const { ref } = useZxing({
  onDecodeResult: (result) => handleScan(result.rawValue),
  paused: mode !== 'camera',
  constraints: { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
  onError: (error) => { /* exibe mensagem + fallback manual */ },
})
```

### Distinção de viewport
`BarcodeScanner` detecta viewport ao montar (`window.innerWidth < 1024`):
- **Mobile**: modo inicial = câmera; botão Câmera visível (`lg:hidden`); viewfinder + campo manual abaixo
- **Desktop**: modo inicial = USB; botão USB visível (`hidden lg:flex`); campo texto + instrução

### Cooldown anti-duplicata + feedback
`lastScanRef` com reset de 2 segundos evita disparo duplo. Pós-leitura: borda do viewfinder fica verde por 1s e `navigator.vibrate?.(200)` dispara.

### HTTPS — acesso LAN (celular)
`@vitejs/plugin-basic-ssl` em `vite.config.ts` habilita HTTPS no Vite dev server.
No primeiro acesso pelo celular aceitar o aviso de certificado não confiável (Avançado → Continuar).
**Variáveis obrigatórias no `.env` do backend para HTTPS funcionar:**
```ini
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000,<IP_DO_SERVIDOR>:5173
FRONTEND_URL=https://localhost:5173
```
`cors.php` usa padrão `#^https?://192\.168\.1\.\d+:5173$#` (aceita HTTP e HTTPS).

---

## Impressão de etiquetas

### react-to-print v3
```typescript
// API v3 — contentRef direto (não content: () => ref.current)
const handlePrint = useReactToPrint({
  contentRef: printRef,
  pageStyle: `@page { size: A4; margin: 10mm; }`,
})
// retorna função, não { handlePrint }
handlePrint()
```

### Tamanhos suportados
- **A4:** grid automático de etiquetas 50×30mm (189×113px a 96dpi)
- **Térmica:** `@page { size: 50mm 30mm; margin: 0; }`

### Atalho do Estoque
Botão de impressora na listagem navega para `/etiquetas` com `state: { productId }`. A página de etiquetas lê o `location.state` no `useEffect` e pré-carrega o produto.

---

## Design system

### Paleta (`frontend/src/styles/theme.css`)

| Variável | Hex | Uso |
|---|---|---|
| `--renovat-black` | `#111111` | Sidebar, textos principais |
| `--renovat-orange` | `#F97316` | Ações, destaques, item ativo no menu |
| `--renovat-gray-light` | `#F5F5F5` | Fundo geral |
| `--renovat-gray-dark` | `#2D2D2D` | Textos secundários |
| `--renovat-success` | `#22C55E` | Entradas, estoque OK |
| `--renovat-danger` | `#EF4444` | Saídas, estoque zerado |
| `--renovat-warning` | `#FBBF24` | Estoque baixo |

### Tipografia
- **Títulos:** `font-['Barlow_Condensed']` bold
- **Corpo:** `DM Sans` via `var(--font-body)`

### Padrões de componentes
- Botões: `border-radius: 12px`, altura mínima `48px`
- Cards: `border-radius: 16px`, padding `24px`
- Área de toque mínima: `48×48px`

---

## Comandos

### Frontend

```bash
cd frontend
npm install
npm run dev      # localhost:5173 (acessível na rede: 0.0.0.0:5173)
npm run build    # gera frontend/dist/
```

### Backend

```bash
cd backend
composer install
php artisan serve --host=0.0.0.0 --port=8000

# Banco de dados
php artisan migrate:fresh --seed   # recria tudo + popula
php artisan migrate                # só novas migrations
php artisan db:seed --class=UserSeeder

# Cache (produção)
php artisan config:cache
php artisan route:cache
```

### Acesso em rede LAN (celular / outros PCs)

O frontend já ouve em `0.0.0.0:5173` (vite.config.ts). Para que outros dispositivos na mesma rede consigam autenticar, o `.env` do backend precisa de:

```ini
SESSION_DOMAIN=                          # vazio — cookie aplica ao host que respondeu
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000,<IP_DO_SERVIDOR>:5173
```

O `cors.php` já aceita qualquer IP no subnet `192.168.1.x:5173` via `allowed_origins_patterns`.
Após editar o `.env`, execute `php artisan config:clear` e reinicie o servidor.

---

## Deploy — Laragon + NSSM

O sistema roda localmente no Windows com Laragon (PHP 8.2 + MySQL 8).
O servidor Laravel é registrado como serviço Windows via NSSM.

**Scripts em `scripts/`:**
- `install-service.bat` — registra o serviço (requer Admin)
- `uninstall-service.bat` — remove o serviço (requer Admin)
- `primeiro-uso.bat` — key:generate + migrate + seed + config:cache
- `backup.bat` — mysqldump para `C:\RenovatPneus\backups\`
- `setup-backup-task.bat` — agenda backup diário às 23:00 (requer Admin)
- `abrir-sistema.bat` — abre http://localhost no navegador

**Instalador:** `installer/renovat-pneus.iss` → compilar com Inno Setup → `RenovatPneus-Setup-v1.0.0.exe`
O instalador verifica se o Laragon está instalado antes de prosseguir.
NSSM 2.24 (x64) em `installer/tools/nssm.exe`.

---

## Estado do projeto

| Fase | Status |
|---|---|
| Fase 0 — Reorganização monorepo | ✅ Concluída |
| Fase 1 — Backend (Laravel, migrations, models, seeders) | ✅ Concluída |
| Infra — Laragon + NSSM + Inno Setup | ✅ Concluída |
| Login por username | ✅ Concluído |
| Fase 2 — API REST (32 rotas, services, policies, resources) | ✅ Concluída |
| Fase 3 — Integração frontend ↔ backend (Axios + React Query + Sanctum) | ✅ Concluída |
| Fase 4 — Scanner de código de barras + Impressão de etiquetas | ✅ Concluída |
| CRUD completo da página Estoque (visualizar, cadastro, edição, exclusão ADM) | ✅ Concluído |
| Geração automática de barcode interno (RNV-XXXXXX, sequencial atômico) | ✅ Concluído |
| Sidebar reordenada + "Saída" renomeada para "Venda" | ✅ Concluído |
| Dashboard: 5 cards clicáveis, serviços no gráfico e lista unificada | ✅ Concluído |
| Finanças: endpoint real, cards receita/custo/lucro, gráficos Recharts, alerta fiado | ✅ Concluído |
| Histórico: lista unificada entradas+vendas, filtros, modal detalhe, export Excel/PDF | ✅ Concluído |
| Finanças: 4 cards (Receita, Custo Produtos, Custo Serviços, Lucro); `price_cost` em Service | ✅ Concluído |
| Finanças: bug `STATUS_LABEL` — `pendente` exibia "fiado" incorretamente | ✅ Corrigido |
| Dashboard: bug de timezone — queries usavam UTC em vez de BRT (whereBetween + Carbon) | ✅ Corrigido |
| Dashboard: gráfico 7 dias agregado no backend (evita truncamento por paginação) | ✅ Corrigido |
| Histórico + Finanças: `saleStatusLabel` unificada em `src/lib/saleStatus.ts` | ✅ Concluído |
| Vendas à vista (pix/dinheiro/cartão) nascem com `status=pago` e `paid_at` preenchido | ✅ Concluído |
| Histórico: botão "Marcar como pago" no modal para quitar fiado pendente | ✅ Concluído |
| Acesso LAN: SESSION_DOMAIN vazio + SANCTUM_STATEFUL_DOMAINS + cors subnet 192.168.1.x | ✅ Concluído |
| HTTPS LAN: @vitejs/plugin-basic-ssl + SESSION_SECURE_COOKIE=true + cors https? | ✅ Concluído |
| Scanner mobile: câmera traseira, onError, feedback visual/vibração, distinção viewport | ✅ Concluído |
| Scanner.tsx: substituído mock por BarcodeScanner real | ✅ Concluído |
| useBarcodeScan: threshold 50ms para distinguir leitor USB de digitação humana | ✅ Concluído |
| Cadastro produto: barcode somente-leitura, gerado no backend, tela de sucesso pós-criação | ✅ Concluído |
| Fase 5 — Testes + build de produção + instalador .exe | ⏳ Pendente |
