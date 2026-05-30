# RenovatPneus

Sistema web de gestão de estoque de pneus para uso em rede interna (localhost).

**Stack:** React 18 + TypeScript + Tailwind CSS v4 (frontend) · Laravel 11 + PHP 8.2 + MySQL 8 (backend)

---

## Estrutura

```
renovat-pneus/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Laravel 11 API REST
├── scripts/           # Scripts de instalação e manutenção Windows
├── installer/         # Script Inno Setup para gerar o .exe
└── README.md
```

---

## Ambiente de Desenvolvimento

### Pré-requisitos
- [Laragon](https://laragon.org/download/) — instala PHP 8.2 + MySQL 8 + Apache automaticamente
- Node.js 20+

### Passos

```bash
# 1. Clonar o repositório (recomendado dentro do www do Laragon)
# C:\laragon\www\renovat-pneus

# 2. Instalar dependências do backend
cd backend
composer install

# 3. Configurar ambiente
cp .env.example .env
php artisan key:generate

# 4. Criar o banco no MySQL
# Abrir Laragon > MySQL > HeidiSQL e executar:
# CREATE DATABASE renovat_pneus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 5. Rodar migrations e seed
php artisan migrate --seed

# 6. Iniciar o servidor backend
php artisan serve --host=0.0.0.0 --port=8000

# 7. Em outro terminal — iniciar o frontend
cd ../frontend
npm install
npm run dev

# 8. Acessar http://localhost:5173
```

---

## Build para Deploy (instalador .exe)

```bash
# 1. Build do frontend
cd frontend && npm run build
# Gera: frontend/dist/

# 2. Otimizar o backend para produção
cd ../backend
php artisan config:cache
php artisan route:cache

# 3. Garantir que o nssm.exe está em installer/tools/
# Baixar em: https://nssm.cc/download

# 4. Compilar o instalador com o Inno Setup
# Instalar Inno Setup: https://jrsoftware.org/isdl.php
# Abrir installer/renovat-pneus.iss e clicar em Build > Compile
# Resultado: installer/dist/RenovatPneus-Setup-v1.0.0.exe
```

---

## Instalação no PC do cliente

1. Instalar o [Laragon](https://laragon.org/download/) (executar apenas uma vez)
2. No Laragon, iniciar o MySQL (botão "Start All" ou só MySQL)
3. Criar o banco de dados `renovat_pneus` no HeidiSQL
4. Executar o `RenovatPneus-Setup-v1.0.0.exe` como Administrador

O instalador fará automaticamente:
- Copiar os arquivos do sistema
- Configurar o banco de dados
- Registrar o servidor como serviço Windows (inicia com o PC)
- Configurar backup diário às 23:00

---

## Credenciais padrão

| Usuário | Senha | Papel |
|---|---|---|
| admin | password | ADM |
| operador1 | password | OPERADOR |
| operador2 | password | OPERADOR |

> ⚠️ Trocar as senhas no primeiro acesso!

---

## Scripts de manutenção (`scripts/`)

| Script | Descrição | Requer Admin |
|---|---|---|
| `abrir-sistema.bat` | Abre o sistema no navegador | Não |
| `install-service.bat` | Registra o servidor como serviço Windows | Sim |
| `uninstall-service.bat` | Remove o serviço Windows | Sim |
| `primeiro-uso.bat` | Configura banco + seed na primeira instalação | Não |
| `backup.bat` | Gera backup do banco de dados | Não |
| `setup-backup-task.bat` | Agenda o backup diário às 23:00 | Sim |

> **NSSM** (Non-Sucking Service Manager) é necessário para `install-service.bat` e `uninstall-service.bat`.
> Baixar em: https://nssm.cc/download e colocar em `installer/tools/nssm.exe`

---

## Backups

Os backups automáticos são salvos em `C:\RenovatPneus\backups\` no formato:
```
renovat_pneus_YYYY-MM-DD.sql
```
Arquivos com mais de 30 dias são removidos automaticamente.

---

## Papéis de usuário

| Papel | Permissões |
|---|---|
| **ADM** | Acesso total — estoque, vendas, serviços, usuários, relatórios |
| **OPERADOR** | Estoque, movimentações, serviços (sem relatórios e sem gestão de usuários) |
