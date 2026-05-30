@echo off
title RenovatPneus - Configuracao Inicial
echo.
echo ================================================
echo  RenovatPneus - Configuracao inicial do sistema
echo ================================================
echo.

:: Caminhos fixos do Laragon e do projeto
set PHP_PATH=C:\laragon\bin\php\php-8.2\php.exe
set BACKEND_DIR=%~dp0..\backend

:: Verificar se o PHP esta disponivel
if not exist "%PHP_PATH%" (
    echo ERRO: PHP nao encontrado em %PHP_PATH%
    echo Verifique se o Laragon esta instalado corretamente.
    pause
    exit /b 1
)

:: Entrar na pasta do backend para todos os comandos artisan
cd /d "%BACKEND_DIR%"

:: Passo 1 — Gerar a chave de seguranca da aplicacao
echo [1/4] Gerando chave de seguranca...
"%PHP_PATH%" artisan key:generate --force
if %errorLevel% neq 0 (
    echo ERRO ao gerar chave. Verifique se o arquivo .env existe.
    pause
    exit /b 1
)

:: Passo 2 — Criar as tabelas no banco de dados
echo [2/4] Criando banco de dados...
"%PHP_PATH%" artisan migrate --force
if %errorLevel% neq 0 (
    echo ERRO ao criar banco. Verifique se o MySQL esta rodando no Laragon.
    pause
    exit /b 1
)

:: Passo 3 — Inserir dados iniciais (usuarios, produtos, servicos)
echo [3/4] Inserindo dados iniciais...
"%PHP_PATH%" artisan db:seed --force
if %errorLevel% neq 0 (
    echo ERRO ao popular banco.
    pause
    exit /b 1
)

:: Passo 4 — Otimizar para producao
echo [4/4] Otimizando sistema...
"%PHP_PATH%" artisan config:cache
"%PHP_PATH%" artisan route:cache
"%PHP_PATH%" artisan view:cache

echo.
echo ================================================
echo  Sistema configurado com sucesso!
echo  Acesse: http://localhost
echo  Login: admin@renovatpneus.com.br
echo  Senha: admin123  (TROQUE APOS O PRIMEIRO ACESSO)
echo ================================================
echo.
pause
