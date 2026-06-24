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
| Backend | Laravel 11 + PHP 8.3 + Sanctum SPA (cookies httpOnly) |
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
- `UpdateProductRequest` **não inclui `barcode`** — barcode é imutável pós-criação e nunca enviado pelo modal de edição. Incluir `barcode` nas regras quebra o `PUT /api/products/{id}` com 422
- Exclusão de venda/entrada: sempre reverte o estoque antes do soft-delete
- `BarcodeSequence::generateNext()` usa `do/while` para pular barcodes já existentes (`Product::withTrashed()->where('barcode', ...)->exists()`). Migration `2026_06_16_000001_sync_barcode_sequence` sincroniza `last_sequence` com o maior `RNV-XXXXXX` real do banco — necessária quando `last_sequence` ficou adiantado por rollbacks ou testes

**Auth / Sanctum:**
- Login por `username` (não email)
- `AuthService` bloqueia usuários com `active = false`
- Logout: `Auth::guard('web')->logout()` — não `Auth::logout()` (lança 500 com Sanctum)
- `AuthContext` logout: `setUser(null)` em `finally` — deslogado mesmo se backend falhar
- `SESSION_SECURE_COOKIE=false` obrigatório em produção — o sistema serve HTTP puro via LAN; browsers recusam enviar cookies `Secure` em HTTP, quebrando a sessão a cada F5

**Frontend prod vs dev:**
- Dev: Vite proxy `/api` → `localhost:8000` (`VITE_API_URL=''`)
- Prod: frontend em `backend/public/`, mesma origem — sem proxy, sem URL separada
- `routes/web.php` tem catch-all que serve `index.html` para o React Router funcionar

**Relatórios — aba Serviços (`GET /api/reports/services`):**
- Rota no grupo `role:adm`, igual às abas Entradas e Vendas
- `ReportService::getServicesReport()` — sem filtro de status (canceladas incluídas, igual à aba Vendas). Filtros opcionais: `user_id`, `service_id`
- Retorna por item de `SaleService`: `sale_id`, `service_name`, `customer_name`, `quantity`, `unit_price`, `subtotal`, `created_at` (da venda), `payment_method`, `user_name`, `status`
- Timezone e `whereBetween`: mesmo padrão de `getEntriesReport()` / `getSalesReport()` (`config('app.business_timezone')`, `startOfDay`/`endOfDay` → UTC)
- Frontend: `useServicesReport` em `hooks/useReports.ts`; `ServiceReportItem` em `types/index.ts`; `exportServicesToExcel` em `lib/export.ts`
- Select de filtro mostra "Serviço" (lista de `useServices()`) quando `tab === 'servicos'`, "Produto" nas outras abas
- Totalizador: soma todos os itens inclusive cancelados (mesmo critério da aba Vendas)

**Paginação de produtos (`GET /api/products`):**
- Resposta é `LengthAwarePaginator` via `ResourceCollection` → `{ data[], links{}, meta{} }`
- `meta.last_page` e `meta.total` ficam dentro de `meta` — não na raiz. Usar `data?.meta?.last_page`
- Frontend: `useProducts({ page })` com `placeholderData: keepPreviousData` (evita flicker)
- Ao criar produto, resetar para `currentPage = 1` (novo produto aparece no topo — ordenação `created_at desc, id desc`)
- `useProducts(filters?, options?)` — segundo argumento `{ enabled?: boolean }` desativa a query quando não necessário (ex.: `Saida.tsx` desativa até o debounce atingir 2+ caracteres)

**Invalidação de cache React Query:**
- `useCreateProduct.onSuccess` → invalida `PRODUCT_KEYS.all` + `DASHBOARD_KEYS.summary` + `MOVEMENT_KEYS.all`
- `useCreateMovement.onSuccess` → invalida `MOVEMENT_KEYS.all` + `PRODUCT_KEYS.all` + `DASHBOARD_KEYS.summary`
- `useCreateSale.onSuccess` → invalida `SALE_KEYS.all` + `PRODUCT_KEYS.all` + `MOVEMENT_KEYS.all` + `DASHBOARD_KEYS.summary` + `['finance']`
- `FinanceController::summary()` só consulta `Sale` — criar produto/movimento NÃO afeta o financeiro, não invalidar `['finance']` nesses casos

**Scanner de barcode:**
- `handleScan` nas páginas Entrada, Saida e **Etiquetas** é **async** — busca por `GET /api/products/barcode/{code}`, não lista local
- `Etiquetas.tsx` — pré-carrega produto via `location.state?.productId` usando `useProduct(id ?? 0)` hook + `productAddedRef` para evitar dupla adição; toast de erro se id não existe mais
- `Etiquetas.tsx` — empty-state div fica **fora** do `ref={printRef}`. O `printRef` contém **só** LabelItems. Misturar empty-state + LabelItems dentro do printRef causava `NotFoundError: removeChild` no commit do React (4 tentativas de fix, resolvido na 4ª pela separação estrutural)
- USB/HID: listener no **`document`** (não em `<input>` oculto) — funciona independente de qual elemento está focado. Threshold 80ms entre teclas. Ignora eventos em `INPUT[text]` e `TEXTAREA` para não interceptar digitação humana
- Câmera: `result.rawValue.trim()` defensivo; `facingMode: { ideal: 'environment' }`

**Busca de produto na venda (`Saida.tsx`):**
- Campo de texto usa busca server-side com debounce 300ms: `useProducts({ name: debouncedSearch }, { enabled: debouncedSearch.length >= 2 })`
- Dropdown não aparece para buscas < 2 caracteres (evita requisição desnecessária)
- Escala para qualquer volume de produtos — sem limite de página
- Busca por barcode: usar o scanner (`handleScan` async)
- Busca por marca via texto foi removida (era filtro local; não escalava)

**Logs:**
- `LOG_LEVEL=warning` no `.env` NÃO suprime `Log::info()` explícito no código — só filtra logs automáticos do framework
- Ações logadas: login (sucesso/falha), logout, venda criada/excluída, entrada criada/excluída, usuário criado/status alterado

**Decimais:** `parseProduct()`, `parseService()`, `parseSale()` nos services normalizam com `Number()`. Nunca `.toFixed()` direto em valor da API.

---

## Deploy — Instalador Standalone

**Sem Laragon, sem MySQL.** PHP bundled (zip) + SQLite + NSSM.

**PHP bundled: 8.3.31 Thread Safe x64 VS16** (não VS17/8.5+). Build VS16 exige VCRUNTIME 14.20 (qualquer Windows moderno). VS17 exige 14.44 — raro em máquinas sem VS2022, e mesmo com vc_redist instalado a DLL fica pendente de reboot. Incluir `vc_redist.x64.exe` no pacote como fallback.

### Fluxo do instalar.bat (8 passos)

**Detecção de update:** se `C:\RenovatPneus\backend\.env` existir, para AMBOS os serviços (API + SSL) antes de copiar arquivos — senão "arquivo em uso".

1. Instala `runtime\vc_redist.x64.exe` (silencioso, sem reboot) → extrai `runtime\php.zip` → `C:\RenovatPneus\runtime\php\`
2. Copia `app\` → `C:\RenovatPneus\backend\` (xcopy). **Após o xcopy:** `del bootstrap\cache\*.php` + `rd /s /q vendor\laravel\pail` e `vendor\laravel\pao` — xcopy não remove sobras de instalações anteriores
3. Cria pastas + `icacls` em `storage/` e `bootstrap/cache/`
4. Configura `.env`: em update, restaura `.env` do backup e verifica guard de `APP_KEY` (ver abaixo). Em install limpo, detecta IP local (filtro RFC 1918) e grava `SANCTUM_STATEFUL_DOMAINS` com todas as portas
5. Guard de APP_KEY: `findstr /b /c:"APP_KEY=base64:" .env` — se ausente, roda `artisan key:generate --force`. Evita `MissingAppKeyException` herdada de instalação anterior que falhou
6. `type nul > database\database.sqlite` (se não existir) + `migrate --force`. Seed condicional: só se `users` estiver vazia (update sobre banco existente não re-seed)
7. `optimize:clear` + `package:discover` + `config:cache` + `route:cache` + `view:cache` — nessa ordem. `optimize:clear` antes para não cachear estado stale
8. NSSM service (auto-start) + `netsh` firewall portas 8000 e 8443

### php.ini — extensões habilitadas
`pdo_sqlite`, `sqlite3`, `openssl`, `mbstring`, `fileinfo`
> `bcmath`, `xml`, `json`, `tokenizer` são **built-in** no PHP 8.3 — não precisam de `extension=`

### composer.json — configurações críticas para o instalador
```json
"extra": {
    "laravel": {
        "dont-discover": ["laravel/pail", "laravel/pao"]
    }
},
"config": {
    "platform": { "php": "8.3.0" }
}
```
`dont-discover` impede que `package:discover` registre pacotes dev (pail, pao) no `bootstrap/cache/packages.php` — mesmo que sobrem no vendor de instalação anterior. `platform.php` força o Composer a resolver dependências para PHP 8.3 (evita Symfony 8.x que exige PHP 8.4.1+).

### Detecção de IP local (filtro RFC 1918)
`ipconfig | findstr IPv4` pega adaptadores VPN/cloud com IP público. Usar PowerShell com regex:
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -match '^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)'
}
```
Incluir **todos** os IPs privados no `SANCTUM_STATEFUL_DOMAINS` (máquinas com 2+ adaptadores).

**Escape em `for /f` + PowerShell no batch:** `\"` é mangled pelo cmd (some ou vira espaço, corrompendo o `.env`). Usar aspas **simples** dentro do comando PowerShell: `-join ','` funciona, `-join \",\"` quebra silenciosamente.

### Pacote de Update (pós-entrega)

Para atualizações no cliente sem reinstalar: `Desktop\RenovatPneus-Update-vX.Y.Z\`

```
update.bat                                    Script 8 passos — requer Admin
LEIA-ME.txt
backend\app\Models\BarcodeSequence.php
backend\app\Http\Controllers\Api\ProductController.php
backend\database\migrations\*.php
public\                                       frontend compilado
tools\verify_migration.php                    checagem pós-migration
```

**O que o update.bat faz (v1.0.4+):** para serviços (API + SSL) → backup timestampado do `.env` → limpa `public\assets\` inteira → copia `public\` novo + `copy /Y index.html` explícito → guard `SESSION_SECURE_COOKIE=false` in-place com labels (sem if aninhado; UTF-8 sem BOM via `[IO.File]::WriteAllText` — `Set-Content` do PS 5.1 grava UTF-16 com BOM e quebra o Laravel) → `config:clear` + `config:cache` + `route:cache` + `view:cache` → reinicia serviços → health check. `:ABORT` tenta reiniciar os serviços antes de sair e exibe o caminho do backup. Todas as verificações de `%errorLevel%` usam `!errorLevel!` (delayed expansion) para evitar expansão prematura em blocos `( )`.

**Última versão entregue:** v1.0.4 (2026-06-23) — (1) fix Chrome Tradutor: `translate="no"` + `lang="pt-BR"` no `<html>` e `<meta name="google" content="notranslate">` no `index.html` — o tradutor automático substituía nós de texto fora do React causando `NotFoundError: removeChild`; (2) fix busca no Estoque: guard `?? ''` em `name`/`size` e `.filter(Boolean)` nas marcas para campos `null` no banco (bundle `index-1T2Qwnhp.js`).
Anterior: v1.0.3 (2026-06-23) — fix etiquetas em produtos de página 2+; busca server-side com debounce em Saida; versão atualizada na UI; fix estrutural NotFoundError removeChild na página Etiquetas (empty state movido para fora do printRef — bundle `index-Cqf7-kNG.js`).
Anterior: v1.0.2 (2026-06-17) — aba Serviços no Relatório + fix edição de produto (422).
v1.0.1 (2026-06-17) — Bug1a (paginação), Bug1b (invalidação), Bug2 (barcode collision), Bug3 (sessão perdida no F5).

---

### Gerar pacote para o cliente
```batch
:: 1. Rodar na raiz do projeto:
preparar-app.bat
:: → npm run build → copia dist → backend/public/
:: → robocopy /MIR backend/ → instalador\app\ (remove sobras como pail, phpunit)
:: → também copia deploy/config/ssl_generate.php → instalador\config\

:: 2. Garantir que runtime\ tenha:
::    php.zip           (PHP 8.3.31 TS x64 VS16 — windows.php.net/download)
::    vc_redist.x64.exe (aka.ms/vs/17/release/vc_redist.x64.exe — ~24MB)
::    nssm.exe          (já incluído)
::    stunnel\          (estrutura completa — ver abaixo)

:: 3. Entregar pasta ao cliente → instalar.bat como Administrador
```

**preparar-app.bat usa `robocopy /MIR`** (não xcopy) para copiar o backend — `/MIR` espelha o source e **remove** arquivos no destino que não existem no source. Essencial para que pacotes dev removidos do vendor não sobrevivam no instalador.

**Pacote pronto em:** `Desktop\RenovatPneus_v1.0.0_Instalador\`
**URL cliente:** `http://localhost:8000` | `http://<IP-LAN>:8000`
**URL câmera (celular):** `https://<IP-LAN>:8443` (aceitar aviso de certificado uma vez)
**Credenciais iniciais:** `admin` / `password`

### HTTPS para câmera no celular (stunnel)

`getUserMedia` (câmera) exige HTTPS — em `http://IP` o browser bloqueia. Solução: stunnel como proxy TLS na porta 8443.

**Estrutura necessária em `runtime\stunnel\`** (copiar de `C:\Program Files (x86)\stunnel\`):
```
runtime\stunnel\
  bin\   tstunnel.exe, stunnel.exe, libcrypto-3-x64.dll, libssl-3-x64.dll, libssp-0.dll
  config\ openssl.cnf, fipsmodule.cnf, ca-certs.pem, stunnel.pem
  engines\ capi.dll, padlock.dll, pkcs11.dll
  ossl-modules\ fips.dll, legacy.dll, pkcs11prov.dll
```

**Como popular `runtime\stunnel\`:**
1. Instalar stunnel (`stunnel-x.xx-win64-installer.exe`) no PC do desenvolvedor
2. Copiar toda a pasta `C:\Program Files (x86)\stunnel\` → `instalador\runtime\stunnel\` (exceto `doc\` e `uninstall.exe`)

**O que o instalar.bat faz automaticamente:**
- Detecta `runtime\stunnel\bin\tstunnel.exe` → ativa setup HTTPS
- xcopy da árvore stunnel → `C:\RenovatPneus\runtime\stunnel\`
- Roda `config\ssl_generate.php` via PHP bundled → gera `server.crt` + `server.key` + `stunnel.conf`
- Registra serviço NSSM `RenovatPneusSSL` com `AppDirectory=runtime\stunnel\bin` e `AppEnvironmentExtra=OPENSSL_CONF=...`
- Abre porta 8443 no firewall

**Armadilhas já resolvidas — stunnel:**
- `tstunnel.exe` (headless) — não usar `stunnel.exe` (GUI, não roda como serviço via NSSM)
- `foreground = yes` é opção Unix-only — não incluir no `stunnel.conf` no Windows
- `openssl_pkey_export()` no PHP precisa receber `$config` como 4º argumento, senão a chave fica vazia
- `ssl_generate.php` precisa apontar `'config' => $opensslCnf` para `php/extras/ssl/openssl.cnf` do PHP bundled
- NSSM `AppEnvironmentExtra` (não `AppEnvironment`) — `AppEnvironment` substitui o ambiente inteiro, stunnel perde PATH e falha
- xcopy do stunnel sem guard `if not exist` — reinstalações devem sempre sobrescrever
- Check de existência do stunnel no **source** do instalador (`%~dp0runtime\stunnel\bin\tstunnel.exe`), não no destino

**Armadilhas do instalador geral (debugadas no cliente em 2026-06-12):**
- **PHP VS16 obrigatório** — VS17 (8.5+) crasha em máquinas sem VCRUNTIME 14.44. Mesmo com vc_redist instalado, reboot é necessário (DLL em uso). PHP 8.3 VS16 exige só 14.20, presente em qualquer Windows moderno
- **APP_KEY perdido para sempre em updates** — se `key:generate` falha na primeira instalação, o `.env` fica sem chave e todos os updates futuros preservam o `.env` defeituoso → `MissingAppKeyException` (500). Guard obrigatório no instalador após restaurar `.env`
- **xcopy não remove sobras** — `laravel/pail`, `phpunit` e outros pacotes dev de instalações anteriores persistem no destino → "Class not found" no `package:discover`. Solução: `robocopy /MIR` no `preparar-app.bat` + limpeza explícita no instalador após xcopy
- **IP de VPN no .env** — `ipconfig | findstr IPv4` pega adaptadores VPN com IP público → Sanctum rejeita todas as sessões. Usar `Get-NetIPAddress` com filtro RFC 1918
- **Update deve parar TODOS os serviços** (API + SSL) antes do xcopy — parar só o API deixa stunnel com DLLs em uso → "violação de compartilhamento"
- **Diagnóstico remoto:** `Select-String "production.ERROR" laravel.log | Select-Object -Last 3 | ForEach-Object { $_.Line.Substring(0,400) }` — saída pequena que o cliente consegue fotografar ou copiar

**SANCTUM e sessão via HTTPS:**
- `SESSION_DOMAIN=` (vazio) — cookie funciona para qualquer host (localhost ou IP)
- `SANCTUM_STATEFUL_DOMAINS` deve incluir **ambas as portas**: `IP:8000` e `IP:8443`
- O instalar.bat detecta o IP local e grava no `.env`: `localhost:8000,127.0.0.1:8000,localhost:8443,127.0.0.1:8443,IP:8000,IP:8443`
- `config:cache` roda **após** a detecção do IP — ordem importa

**Frontend (`BarcodeScanner.tsx`):**
- `window.isSecureContext` detectado no módulo (fora do componente) — se `false`, exibe aviso âmbar com link `https://IP:8443` clicável e passa `paused: true` para `useZxing` (evita erro no browser)

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
| Versionamento v1.0.3 + créditos na sidebar/drawer | ✅ |
| Fase 5 — Instalador standalone (PHP bundled + SQLite + NSSM) | ✅ |
| HTTPS via stunnel (porta 8443) + câmera no celular | ✅ |
| Pacote distribúível na Área de Trabalho | ✅ Pronto |
| Update v1.0.1 (paginação, invalidação, barcode, sessão) | ✅ Entregue 2026-06-17 |
| Update v1.0.2 — aba Serviços no Relatório             | ✅ Entregue 2026-06-17 |
| Update v1.0.3 — etiquetas pág.2+, busca venda server-side, versão UI | ✅ Entregue 2026-06-23 |
| Update v1.0.4 — fix Chrome Tradutor (translate="no") + fix busca Estoque (null toLowerCase) | ✅ Entregue 2026-06-23 |
