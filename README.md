# RenovatPneus

Sistema web de gestão de estoque de pneus para uso em rede interna. Roda inteiramente no PC da loja — sem internet, sem nuvem, sem dependências externas.

**Versão:** v1.0.0 · **Status:** Concluído

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 + Vite 6 |
| Backend | Laravel 11 + PHP 8.2 + Sanctum (cookies httpOnly) |
| Banco de dados | SQLite — dev e produção |
| Scanner | react-zxing v3 (câmera) + USB/HID (leitor externo) |
| Serviço Windows | NSSM 2.24 (`php artisan serve` como serviço) |
| HTTPS (câmera) | stunnel — proxy TLS na porta 8443 |

---

## Funcionalidades

- **Estoque:** cadastro de lotes de pneus com barcode, controle de quantidade
- **Movimentações:** entradas e saídas com rastreio completo
- **Vendas:** registro de vendas com status (pendente / pago / cancelado)
- **Scanner de barcode:** câmera do celular (HTTPS) ou leitor USB/HID
- **Impressão de etiquetas:** layout A4 e térmico 80×40mm
- **Relatórios:** entradas + vendas com filtros e exportação Excel/PDF (só ADM)
- **Usuários:** gestão de contas com dois papéis (ADM / OPERADOR)
- **Logs de auditoria:** login, logout, vendas, entradas, usuários

---

## Papéis de usuário

| Papel | Permissões |
|---|---|
| **ADM** | Acesso total — estoque, vendas, movimentações, usuários, relatórios |
| **OPERADOR** | Estoque, movimentações e vendas (sem relatórios, sem gestão de usuários) |

---

## Instalador standalone (cliente)

O instalador não requer Laragon, MySQL ou qualquer software adicional. Tudo é incluído no pacote.

### O que o `instalar.bat` faz automaticamente

1. Extrai o PHP 8.2 bundled em `C:\RenovatPneus\runtime\php\`
2. Copia os arquivos do sistema em `C:\RenovatPneus\backend\`
3. Detecta o IP da máquina e configura `.env` (SESSION_DOMAIN, SANCTUM_STATEFUL_DOMAINS, APP_URL)
4. Cria o banco SQLite e roda migrations + seed
5. Registra `php artisan serve` como serviço Windows via NSSM (auto-start)
6. Abre a porta 8000 no firewall
7. *(Opcional)* Configura stunnel como proxy HTTPS na porta 8443 para câmera no celular

### Uso

```
instalar.bat   → executar como Administrador
```

Após a instalação:

| Acesso | URL |
|---|---|
| PC da loja | `http://localhost:8000` |
| Celulares (Wi-Fi) | `http://<IP-LAN>:8000` |
| Câmera no celular | `https://<IP-LAN>:8443` *(aceitar aviso de certificado)* |

**Credenciais iniciais:** `admin` / `password`
> Trocar a senha no primeiro acesso.

---

## Desenvolvimento

### Pré-requisitos

- [Laragon](https://laragon.org/download/) com PHP 8.2 e SQLite habilitados
- Node.js 20+

### Passos

```bash
# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000

# Frontend (outro terminal)
cd frontend
npm install
npm run dev
# Acessar http://localhost:5173
```

O Vite proxy redireciona `/api/*` para `localhost:8000` automaticamente.

---

## Gerar pacote para o cliente

```bat
:: Na raiz do projeto — gera o instalador em Desktop\RenovatPneus_v1.0.0_Instalador\
preparar-app.bat
```

O script:
1. Roda `npm run build` no frontend
2. Copia o `dist/` para `backend/public/`
3. Copia o backend para a pasta do instalador (excluindo `.env`, cache, `database.sqlite`)
4. Copia `deploy/config/ssl_generate.php` para `config/` do instalador

Depois de rodar `preparar-app.bat`, garantir que a pasta `runtime\` do instalador contém:
- `php.zip` — PHP 8.2 Thread Safe x64 ([windows.php.net](https://windows.php.net/download))
- `nssm.exe` — já incluído no repositório
- `stunnel\` — estrutura completa (ver `CLAUDE.md` para detalhes)

---

## Estrutura do repositório

```
RenovatPneus/
├── frontend/              # React + Vite + TypeScript
│   └── src/app/           # páginas, componentes, hooks, services, types
├── backend/               # Laravel 11 API REST
│   ├── app/               # Controllers, Services, Models, Resources
│   ├── routes/            # api.php + web.php (catch-all SPA)
│   └── public/            # frontend buildado (gerado por preparar-app.bat)
├── deploy/
│   ├── config/            # .env.production, php.ini, ssl_generate.php
│   └── scripts/           # install.bat, uninstall.bat
├── installer/             # espelho do pacote distribuível
├── preparar-app.bat       # script de build + empacotamento
└── CLAUDE.md              # guia técnico completo para desenvolvimento
```
