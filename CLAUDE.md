# RenovatPneus — Guia para Claude Code

Sistema web de gestão de estoque de pneus. PC Windows como servidor, 2-3 dispositivos na mesma rede Wi-Fi acessam via navegador.

**Repositório:** `https://github.com/FilSantos12/RenovatPneus`

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind v4 + Vite 6 |
| HTTP / estado | Axios (`withCredentials: true`) + TanStack React Query v5 |
| Roteamento | React Router v7 — `createBrowserRouter` |
| Backend | Laravel 11 + PHP 8.2 + Sanctum SPA (cookies httpOnly) |
| Banco | SQLite — dev e produção (`backend/database/database.sqlite`) |
| Deploy | `php artisan serve` via NSSM (serviço Windows), porta 8000 |
| Frontend prod | `backend/public/` — mesma origem, sem proxy |

---

## Estrutura

```
RenovatPneus/
├── frontend/src/app/         # páginas, componentes, hooks, services, types
├── backend/                  # Laravel 11; public/ tem o React buildado
├── deploy/                   # pacote de distribuição (scripts, config, php.ini, nssm.exe)
├── installer/tools/nssm.exe  # NSSM 2.24 x64
├── preparar-app.bat          # empacota backend → Desktop\RenovatPneus_v1.0.0_Instalador\app\
└── preparar-app-exclude.txt  # exclusões do xcopy (.env, cache, database.sqlite)
```

**Arquivos-chave:**
- `frontend/src/app/types/index.ts` — tipos TypeScript alinhados com a API
- `frontend/src/lib/` — axios.ts, errors.ts, saleStatus.ts, export.ts
- `frontend/src/services/` — parse + normalização de decimais (Number())
- `backend/routes/api.php` — 35 rotas; `web.php` — catch-all SPA
- `backend/app/Services/` — regras de negócio + transações
- `deploy/config/php.ini` — extensões habilitadas para produção

---

## Decisões e armadilhas

**Tipos / API:**
- IDs são `number` (auto-increment SQLite)
- Laravel retorna `decimal`/`float` como **string** — normalizar com `Number()` nos services
- `AuthController::login` retorna `{ user, message }` — usar `data.user`. Demais endpoints: `data.data`
- Enums sempre lowercase: `adm | operador`, `entrada | saida`, `pendente | pago | cancelado`

**Modelo de lote / Entrada unificada:**
- Cada produto representa um lote físico com barcode próprio (`RNV-000006` = 20 pneus entrados no dia X). Novos lotes = novo cadastro, não entrada em produto já existente
- Menu lateral: item "Entrada/Estoque" (rota `/estoque`) — entrada e catálogo unificados. Item isolado "Entrada" foi removido
- Rota `/entrada` **removida** do router; `Entrada.tsx` existe no disco mas não está em `routes.tsx`
- Dashboard "Registrar Entrada": `navigate('/estoque', { state: { openModal: true } })`. `Estoque.tsx` lê `location.state?.openModal` no `useEffect`, abre `ProductFormModal` e limpa o state com `window.history.replaceState`
- `ProductFormModal` título: `'Entrada'` em modo criação, `'Editar Produto'` em modo edição

**Banco:**
- `database.sqlite` não é commitado. No instalador, criar arquivo vazio antes do `migrate` — PDO não cria o arquivo, só conecta
- `lockForUpdate()` + `DB::transaction` em MovementService e SaleService — sem race condition no estoque
- Exclusão de venda/entrada: sempre reverte o estoque antes do soft-delete

**Auth / Sanctum:**
- Login por `username` (não email)
- `AuthService` bloqueia usuários com `active = false`
- Logout: `Auth::guard('web')->logout()` — não `Auth::logout()` (lança 500 com Sanctum)
- `AuthContext` logout: `setUser(null)` em `finally` — deslogado mesmo se backend falhar

**Frontend prod vs dev:**
- Dev: Vite proxy `/api` → `localhost:8000` (`VITE_API_URL=''`)
- Prod: frontend em `backend/public/`, mesma origem — sem proxy, sem URL separada
- `routes/web.php` tem catch-all que serve `index.html` para o React Router funcionar

**Scanner de barcode:**
- `handleScan` nas páginas Entrada/Saida é **async** — busca por `GET /api/products/barcode/{code}`, não lista local (que tem só 15 itens da página 1)
- USB/HID: listener no **`document`** (não em `<input>` oculto) — funciona independente de qual elemento está focado. Threshold 80ms entre teclas. Ignora eventos em `INPUT[text]` e `TEXTAREA` para não interceptar digitação humana
- Câmera: `result.rawValue.trim()` defensivo; `facingMode: { ideal: 'environment' }`

**Logs:**
- `LOG_LEVEL=warning` no `.env` NÃO suprime `Log::info()` explícito no código — só filtra logs automáticos do framework
- Ações logadas: login (sucesso/falha), logout, venda criada/excluída, entrada criada/excluída, usuário criado/status alterado

**Decimais:** `parseProduct()`, `parseService()`, `parseSale()` nos services normalizam com `Number()`. Nunca `.toFixed()` direto em valor da API.

---

## Deploy — Instalador Standalone

**Sem Laragon, sem MySQL.** PHP bundled (zip) + SQLite + NSSM.

### Fluxo do instalar.bat (8 passos)
1. Extrai `runtime\php.zip` → `C:\RenovatPneus\runtime\php\`
2. Copia `config\php.ini` → `runtime\php\php.ini` ← **obrigatório** (PHP extrai sem .ini ativo)
3. Copia `app\` → `C:\RenovatPneus\backend\` (xcopy)
4. Cria pastas + `icacls` em `storage/` e `bootstrap/cache/`
5. Configura `.env` (preserva em atualização) + `key:generate`
6. `type nul > database\database.sqlite` + `migrate --force --seed`
7. `config:cache` + `route:cache` + `view:cache`
8. NSSM service (auto-start) + `netsh` firewall porta 8000

### php.ini — extensões habilitadas
`pdo_sqlite`, `sqlite3`, `openssl`, `mbstring`, `fileinfo`
> `bcmath`, `xml`, `json`, `tokenizer` são **built-in** no PHP 8.2 — não precisam de `extension=`

### Gerar pacote para o cliente
```batch
:: 1. Rodar na raiz do projeto:
preparar-app.bat
:: → npm run build → copia dist → backend/public/ → xcopy backend/ → instalador\app\

:: 2. Garantir que runtime\ tenha:
::    php.zip  (PHP 8.2 Thread Safe x64 — windows.php.net/download)
::    nssm.exe (já incluído)

:: 3. Entregar pasta ao cliente → instalar.bat como Administrador
```

**Pacote pronto em:** `Desktop\RenovatPneus_v1.0.0_Instalador\` (app 58.9 MB + php.zip 34 MB + nssm.exe)
**URL cliente:** `http://localhost:8000` | `http://<IP-LAN>:8000`
**Credenciais iniciais:** `admin` / `password`

---

## Estado do projeto

| Área | Status |
|---|---|
| Backend — API REST (35 rotas, services, policies, resources) | ✅ |
| Frontend — todas as páginas + integração Sanctum | ✅ |
| Scanner USB/HID + câmera (react-zxing v3) | ✅ |
| Impressão de etiquetas (react-to-print v3, A4 + térmica 80×40mm) | ✅ |
| Logs de auditoria (Auth, Sale, Movement, User) | ✅ |
| Página Relatórios (entradas + vendas, filtros, export Excel/PDF) — só ADM | ✅ |
| Versionamento v1.0.0 + créditos na sidebar/drawer | ✅ |
| Fase 5 — Instalador standalone (PHP bundled + SQLite + NSSM) | ✅ |
| Pacote distribúível na Área de Trabalho | ✅ Pronto |
