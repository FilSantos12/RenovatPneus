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
| Roteamento | React Router v7 — **`createHashRouter`** |
| Componentes UI | Radix UI + shadcn/ui (`src/app/components/ui/`) |
| Gráficos | Recharts |
| Notificações | Sonner (toast) |
| Formulários | React Hook Form |
| Animações | Motion (Framer Motion) |
| Ícones | Lucide React |

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
├── index.html
├── vite.config.ts              # base: '/RenovatPneus/' (GitHub Pages)
├── package.json
└── src/
    ├── main.tsx
    ├── styles/
    │   ├── index.css           # Importa fonts, tailwind e theme
    │   ├── fonts.css           # Google Fonts (Barlow Condensed + DM Sans)
    │   ├── tailwind.css        # @import "tailwindcss"
    │   └── theme.css           # Variáveis CSS da paleta + tipografia
    └── app/
        ├── App.tsx             # Raiz: AuthProvider + RouterProvider + Toaster
        ├── routes.tsx          # createHashRouter com rotas protegidas
        ├── types/index.ts      # Tipos TS: User, Product, Movement, Service, Sale...
        ├── data/mockData.ts    # Dados mock (ainda em uso — backend em integração)
        ├── contexts/
        │   └── AuthContext.tsx # Auth mock via localStorage (temporário)
        ├── components/
        │   ├── Layout.tsx      # Sidebar + (MobileHeader + main)
        │   ├── Sidebar.tsx     # Desktop, sticky
        │   ├── MobileHeader.tsx
        │   ├── MobileDrawer.tsx
        │   ├── ProtectedRoute.tsx
        │   └── ui/             # shadcn/ui — não editar diretamente
        └── pages/
            ├── Login.tsx
            ├── Dashboard.tsx
            ├── Estoque.tsx
            ├── Entrada.tsx
            ├── Saida.tsx
            ├── Scanner.tsx
            ├── Etiquetas.tsx
            ├── Historico.tsx
            ├── Financas.tsx        # Relatórios (ADM)
            ├── Servicos.tsx        # CRUD de serviços (ADM + OPERADOR)
            ├── Usuarios.tsx        # Apenas ADM
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
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── AuthController.php   # login, logout, me
│   │   ├── Requests/
│   │   │   ├── Auth/LoginRequest.php
│   │   │   ├── StoreUserRequest.php
│   │   │   └── UpdateUserRequest.php
│   │   └── Resources/
│   │       └── UserResource.php     # id, name, username, role, active
│   ├── Models/
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── Movement.php
│   │   ├── Service.php
│   │   ├── Sale.php
│   │   ├── SaleItem.php
│   │   └── SaleService.php
│   └── Services/
│       └── AuthService.php          # login por username + check active
├── database/
│   ├── migrations/                  # 11 migrations (users→sale_services + username)
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── UserSeeder.php
│       ├── ProductSeeder.php
│       └── ServiceSeeder.php
├── routes/
│   └── api.php                      # /health, /login, /logout, /me
├── config/
│   └── cors.php                     # supports_credentials: true
└── bootstrap/
    └── app.php                      # statefulApi() ativo
```

---

## API — Rotas disponíveis

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/health` | Não | Health check |
| POST | `/api/login` | Não | Login por username |
| POST | `/api/logout` | Sanctum | Logout |
| GET | `/api/me` | Sanctum | Usuário autenticado |

### Exemplo de login

```bash
POST /api/login
{ "username": "admin", "password": "password" }

# Resposta 200:
{ "user": { "id": 1, "name": "Administrador", "username": "admin", "role": "adm", "active": true }, "message": "Login realizado com sucesso." }

# Credenciais erradas → 401
# Campo faltando → 422 com mensagem em português
```

---

## Autenticação

Login por **username** (não email). Email existe na tabela mas não é usado no login.

**Credenciais de teste:**

| Username | Senha | Papel |
|---|---|---|
| `admin` | `password` | ADM |
| `operador1` | `password` | OPERADOR |
| `operador2` | `password` | OPERADOR |

**Papéis:**
- `ADM` — acesso total (usuários, finanças, exportações)
- `OPERADOR` — estoque, movimentações, serviços

O `AuthService::login` verifica `active = true` — usuário desativado não consegue entrar.

> O frontend ainda usa `AuthContext.tsx` com mock. A integração com o backend Laravel é a próxima etapa.

---

## Banco de dados — Tabelas

| Tabela | SoftDeletes | Observação |
|---|---|---|
| `users` | ✅ | Campo `username` único; `active` para desativar sem deletar |
| `products` | ✅ | `barcode` único + indexado |
| `movements` | ❌ | Auditoria — nunca apaga |
| `services` | ✅ | |
| `sales` | ✅ | |
| `sale_items` | ❌ | Registro financeiro — nunca apaga |
| `sale_services` | ❌ | Registro financeiro — nunca apaga |

---

## Roteamento (Frontend)

Usa **`createHashRouter`** — obrigatório para o GitHub Pages. Não trocar para `createBrowserRouter`.

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
| `/financas` | Financas | Autenticado (sidebar: só ADM) |
| `/usuarios` | Usuarios | `requiredRole="ADM"` |
| `/acesso-negado` | AcessoNegado | — |

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
npm run dev      # localhost:5173
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
| Fase 2 — API REST (Controllers, Resources, Policies) | 🔄 Em andamento |
| Integração frontend ↔ backend | ⏳ Pendente |
