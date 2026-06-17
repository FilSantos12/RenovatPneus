@echo off
setlocal
title RenovatPneus - Preparar Pacote de Distribuicao

set PROJECT=%~dp0
set FRONTEND=%PROJECT%frontend
set BACKEND=%PROJECT%backend
set DEST=C:\Users\Admin\Desktop\RenovatPneus_v1.0.0_Instalador\app

cls
echo.
echo  ================================================
echo    RenovatPneus - Preparar Pacote
echo  ================================================
echo.
echo  Este script prepara o app para distribuicao:
echo  1. Builda o frontend (React ^> dist/)
echo  2. Copia dist para backend/public/
echo  3. Copia o backend para o instalador da area de trabalho
echo.
echo  Destino: %DEST%
echo.
pause

:: [1/3] Build do frontend
echo.
echo  [1/3] Buildando frontend (React)...
cd /d "%FRONTEND%"
call npm run build
if %errorLevel% neq 0 (
    echo  ERRO: Build do frontend falhou.
    pause & exit /b 1
)
echo        Frontend buildado em frontend/dist/

:: [2/3] Copiar dist para backend/public
echo.
echo  [2/3] Copiando dist para backend/public...
xcopy /E /Y /I /Q "%FRONTEND%\dist\*" "%BACKEND%\public\"
echo        Copiado para backend/public/

:: [3/3] Copiar backend para instalador
echo.
echo  [3/3] Copiando backend para o instalador...
echo  (vendor/ tem ~80MB, pode demorar alguns minutos)
echo.
if not exist "%DEST%" mkdir "%DEST%"
:: /MIR espelha: copia novos e REMOVE sobras (ex.: pacotes dev removidos do vendor)
robocopy "%BACKEND%" "%DEST%" /MIR /NFL /NDL /NJH /NJS ^
    /XD .git node_modules "storage\logs" "storage\framework\cache" "storage\framework\sessions" "storage\framework\views" "bootstrap\cache" ^
    /XF .env database.sqlite
if %errorLevel% gtr 3 (
    echo  AVISO: robocopy retornou erro %errorLevel%.
    echo  Verifique se o app funcionou mesmo assim.
)
echo        Backend copiado para instalador\app\

:: Limpar arquivos que nao devem ir para o cliente
del /f /q "%DEST%\bootstrap\cache\packages.php" >nul 2>&1
del /f /q "%DEST%\bootstrap\cache\services.php"  >nul 2>&1
del /f /q "%DEST%\storage\logs\laravel*.log"      >nul 2>&1
echo        Arquivos temporarios limpos.

echo.
echo  ================================================
echo    Pacote pronto!
echo  ================================================
echo.
:: Copiar ssl_generate.php para config do instalador
copy /Y "%PROJECT%deploy\config\ssl_generate.php" "C:\Users\Admin\Desktop\RenovatPneus_v1.0.0_Instalador\config\ssl_generate.php" >nul
echo        ssl_generate.php copiado para instalador\config\

echo.
echo  Checklist para distribuicao:
echo.
echo  [OK] app\ copiado para o instalador
echo  [OK] ssl_generate.php copiado para config\
echo  [ ]  Baixar PHP 8.3 TS x64 VS16 e salvar como:
echo         Desktop\RenovatPneus_v1.0.0_Instalador\runtime\php.zip
echo         Link: https://windows.php.net/download/
echo              (PHP 8.3 — Thread Safe — x64 — VS16)
echo  [ ]  OPCIONAL — camera no celular (HTTPS):
echo         Baixar stunnel: https://www.stunnel.org/downloads.html
echo         Versao: stunnel-x.xx-win64-installer.exe
echo         Extrair stunnel.exe e salvar em:
echo           Desktop\RenovatPneus_v1.0.0_Instalador\runtime\stunnel.exe
echo.
echo  Apos os arquivos estarem no lugar:
echo  -> O instalador esta pronto para entregar ao cliente!
echo  -> No cliente: clicar com botao direito em instalar.bat
echo     e escolher "Executar como administrador"
echo.
pause
