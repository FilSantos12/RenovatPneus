@echo off
title RenovatPneus - Desinstalacao

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRO: Execute como Administrador.
    pause & exit /b 1
)

set INSTALL_DIR=C:\RenovatPneus
set NSSM=%INSTALL_DIR%\runtime\nssm.exe
set SERVICE=RenovatPneusAPI

echo Parando e removendo servico Windows...
if exist "%NSSM%" (
    "%NSSM%" stop   %SERVICE% >nul 2>&1
    "%NSSM%" remove %SERVICE% confirm >nul 2>&1
) else (
    net stop %SERVICE% >nul 2>&1
    sc delete %SERVICE% >nul 2>&1
)

echo Removendo regra de firewall...
netsh advfirewall firewall delete rule name="RenovatPneus" >nul 2>&1

echo Removendo tarefa de backup automatico...
schtasks /delete /tn "RenovatPneus Backup" /f >nul 2>&1

echo.
echo Desinstalacao concluida.
echo Os dados (banco SQLite) foram preservados em:
echo   %INSTALL_DIR%\backend\database\database.sqlite
echo Para remover completamente, delete a pasta %INSTALL_DIR% manualmente.
pause
