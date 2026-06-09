@echo off
setlocal enabledelayedexpansion
title RenovatPneus - Instalacao

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRO: Execute como Administrador.
    pause & exit /b 1
)

set INSTALL_DIR=C:\RenovatPneus
set RUNTIME=%INSTALL_DIR%\runtime
set PHP=%RUNTIME%\php\php.exe
set NSSM=%RUNTIME%\nssm.exe
set SERVICE=RenovatPneusAPI
set PORT=8000

cls
echo.
echo  ================================================
echo    RenovatPneus - Instalador Automatico
echo  ================================================
echo.

:: Verificar arquivos necessarios
echo  Verificando pacote...
set FALTANDO=
if not exist "%~dp0..\runtime\php.zip"  set "FALTANDO=!FALTANDO! php.zip"
if not exist "%~dp0..\runtime\nssm.exe" set "FALTANDO=!FALTANDO! nssm.exe"
if not "!FALTANDO!"=="" (
    echo  ERRO: Arquivos faltando em deploy\runtime\:!FALTANDO!
    pause & exit /b 1
)
echo  OK - Pacote completo.
echo.

:: Detectar atualizacao
set IS_UPDATE=0
if exist "%INSTALL_DIR%\backend\.env" set IS_UPDATE=1
if "!IS_UPDATE!"=="1" (
    echo  Atualizacao detectada - preservando dados...
    "%NSSM%" stop %SERVICE% >nul 2>&1
    timeout /t 3 /nobreak >nul
    copy "%INSTALL_DIR%\backend\.env" "%TEMP%\renovatpneus_env.bak" >nul 2>&1
)

:: [1/7] Runtime
echo  [1/7] Extraindo runtime...
if not exist "%RUNTIME%" mkdir "%RUNTIME%"
powershell -NoProfile -Command "Expand-Archive -Path '%~dp0..\runtime\php.zip' -DestinationPath '%RUNTIME%\php' -Force" >nul 2>&1
copy /Y "%~dp0..\runtime\nssm.exe" "%NSSM%" >nul
copy /Y "%~dp0..\config\php.ini"   "%RUNTIME%\php\php.ini" >nul

if not exist "%PHP%" (
    echo  ERRO: php.exe nao encontrado apos extracao.
    pause & exit /b 1
)
echo        Runtime pronto.

:: [2/7] Pastas e permissoes
echo  [2/7] Configurando pastas e permissoes...
mkdir "%INSTALL_DIR%\logs"    >nul 2>&1
mkdir "%INSTALL_DIR%\backups" >nul 2>&1
mkdir "%INSTALL_DIR%\backend\storage\logs"               >nul 2>&1
mkdir "%INSTALL_DIR%\backend\storage\framework\cache"    >nul 2>&1
mkdir "%INSTALL_DIR%\backend\storage\framework\sessions" >nul 2>&1
mkdir "%INSTALL_DIR%\backend\storage\framework\views"    >nul 2>&1
mkdir "%INSTALL_DIR%\backend\bootstrap\cache"            >nul 2>&1
icacls "%INSTALL_DIR%\backend\storage"         /grant "Everyone:(OI)(CI)F" /T >nul 2>&1
icacls "%INSTALL_DIR%\backend\bootstrap\cache" /grant "Everyone:(OI)(CI)F" /T >nul 2>&1
echo        Pastas configuradas.

:: [3/7] Ambiente (.env)
echo  [3/7] Configurando ambiente...
if exist "%TEMP%\renovatpneus_env.bak" (
    copy "%TEMP%\renovatpneus_env.bak" "%INSTALL_DIR%\backend\.env" >nul
    del "%TEMP%\renovatpneus_env.bak" >nul
    echo        Configuracoes anteriores restauradas.
) else (
    copy /Y "%INSTALL_DIR%\deploy\config\.env.production" "%INSTALL_DIR%\backend\.env"
    cd /d "%INSTALL_DIR%\backend"
    "%PHP%" artisan key:generate --force
    echo        Novo .env criado e chave gerada.
)

:: [4/7] Banco de dados
echo  [4/7] Configurando banco de dados...
cd /d "%INSTALL_DIR%\backend"
if not exist "database\database.sqlite" type nul > "database\database.sqlite"
if "!IS_UPDATE!"=="0" (
    "%PHP%" artisan migrate --force --seed
    echo        Banco criado e populado.
) else (
    "%PHP%" artisan migrate --force
    echo        Migrations aplicadas.
)

:: [5/7] Otimizar Laravel
echo  [5/7] Otimizando para producao...
"%PHP%" artisan config:cache
"%PHP%" artisan route:cache
"%PHP%" artisan view:cache
echo        Caches gerados.

:: [6/7] Servico Windows
echo  [6/7] Registrando servico Windows...
"%NSSM%" stop   %SERVICE% >nul 2>&1
"%NSSM%" remove %SERVICE% confirm >nul 2>&1
"%NSSM%" install %SERVICE% "%PHP%"
"%NSSM%" set %SERVICE% AppParameters    "%INSTALL_DIR%\backend\artisan serve --host=0.0.0.0 --port=%PORT%"
"%NSSM%" set %SERVICE% AppDirectory     "%INSTALL_DIR%\backend"
"%NSSM%" set %SERVICE% DisplayName      "RenovatPneus"
"%NSSM%" set %SERVICE% Description      "Sistema de gestao de estoque - RenovatPneus"
"%NSSM%" set %SERVICE% Start            SERVICE_AUTO_START
"%NSSM%" set %SERVICE% AppRestartDelay  3000
"%NSSM%" set %SERVICE% AppStdout        "%INSTALL_DIR%\logs\service.log"
"%NSSM%" set %SERVICE% AppStderr        "%INSTALL_DIR%\logs\service-error.log"
"%NSSM%" set %SERVICE% AppRotateFiles   1
"%NSSM%" set %SERVICE% AppRotateSeconds 86400
"%NSSM%" start %SERVICE% >nul 2>&1
echo        Servico registrado e iniciado.

:: [7/7] Firewall
echo  [7/7] Abrindo porta %PORT% no firewall...
netsh advfirewall firewall delete rule name="RenovatPneus" >nul 2>&1
netsh advfirewall firewall add rule name="RenovatPneus" dir=in action=allow protocol=TCP localport=%PORT% >nul 2>&1
echo        Porta aberta.

:: Testar se subiu
echo.
echo  Aguardando sistema iniciar...
timeout /t 6 /nobreak >nul
"%PHP%" -r "exit(@file_get_contents('http://localhost:%PORT%/api/health')!==false?0:1);" >nul 2>&1
if %errorLevel% equ 0 (
    echo  Sistema respondendo OK.
) else (
    echo  AVISO: Sistema instalado mas nao respondeu no teste inicial.
    echo  Aguarde alguns segundos e acesse http://localhost:%PORT%
    echo  Se persistir: %INSTALL_DIR%\logs\service-error.log
)

:: Resultado final
echo.
echo  ================================================
echo    Instalacao concluida!
echo  ================================================
echo.
echo   Acesso pelo PC da loja:
echo     http://localhost:%PORT%
echo.
echo   Acesso pelos celulares (mesma rede Wi-Fi):
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "IP=%%a"
    set "IP=!IP: =!"
    if not "!IP!"=="127.0.0.1" echo     http://!IP!:%PORT%
)
echo.
echo   Login: admin  /  Senha: password
echo   IMPORTANTE: Troque a senha no primeiro acesso!
echo.
pause
