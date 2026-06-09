@echo off
title RenovatPneus - Build

echo [1/3] Buildando frontend...
cd /d "%~dp0..\..\frontend"
call npm run build
if %errorLevel% neq 0 (
    echo ERRO: Build do frontend falhou.
    pause & exit /b 1
)

echo [2/3] Copiando para backend/public...
set DEST=%~dp0..\..\backend\public
xcopy /E /Y /I "%~dp0..\..\frontend\dist\*" "%DEST%\"

echo [3/3] Build concluido.
echo Frontend disponivel em backend/public/
pause
