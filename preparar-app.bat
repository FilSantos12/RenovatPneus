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
xcopy /E /Y /I /Q "%BACKEND%\*" "%DEST%\" /EXCLUDE:"%PROJECT%preparar-app-exclude.txt"
if %errorLevel% neq 0 (
    echo  AVISO: Alguns arquivos nao foram copiados (permissao ou caminho longo).
    echo  Verifique se o app funcionou mesmo assim.
)
echo        Backend copiado para instalador\app\

echo.
echo  ================================================
echo    Pacote pronto!
echo  ================================================
echo.
echo  Checklist para distribuicao:
echo.
echo  [OK] app\ copiado para o instalador
echo  [ ]  Baixar PHP 8.2 TS x64 e salvar como:
echo         Desktop\RenovatPneus_v1.0.0_Instalador\runtime\php.zip
echo         Link: https://windows.php.net/download/
echo              (Baixar o ZIP da versao Thread Safe x64)
echo.
echo  Apos o php.zip estar no lugar:
echo  -> O instalador esta pronto para entregar ao cliente!
echo  -> No cliente: clicar com botao direito em instalar.bat
echo     e escolher "Executar como administrador"
echo.
pause
