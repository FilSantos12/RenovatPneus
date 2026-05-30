@echo off
title RenovatPneus - Configurando Backup Automatico

:: Verificar privilegios de Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRO: Execute como Administrador.
    pause
    exit /b 1
)

:: Caminho absoluto do script de backup
set SCRIPT_PATH=%~dp0backup.bat

:: Registrar tarefa agendada para rodar todo dia as 23:00
:: /ru SYSTEM garante que rode mesmo sem usuario logado
schtasks /create /tn "RenovatPneus Backup" ^
    /tr "%SCRIPT_PATH%" ^
    /sc daily ^
    /st 23:00 ^
    /ru SYSTEM ^
    /f

if %errorLevel% neq 0 (
    echo ERRO ao criar tarefa agendada.
    pause
    exit /b 1
)

echo.
echo Backup automatico configurado com sucesso!
echo Os backups serao realizados todo dia as 23:00.
echo Os arquivos serao salvos em: C:\RenovatPneus\backups\
echo Os backups mais antigos que 30 dias sao removidos automaticamente.
echo.
pause
