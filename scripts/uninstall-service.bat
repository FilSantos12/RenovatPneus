@echo off
title RenovatPneus - Removendo Servico

:: Verificar privilegios de Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRO: Execute como Administrador.
    pause
    exit /b 1
)

set NSSM_PATH=%~dp0nssm.exe

:: Verificar se o NSSM existe
if not exist "%NSSM_PATH%" (
    echo ERRO: nssm.exe nao encontrado em %NSSM_PATH%
    pause
    exit /b 1
)

echo Parando o servico RenovatPneusAPI...
"%NSSM_PATH%" stop RenovatPneusAPI

echo Removendo o servico do Windows...
"%NSSM_PATH%" remove RenovatPneusAPI confirm

echo.
echo Servico removido com sucesso.
echo O servidor nao sera mais iniciado automaticamente com o Windows.
echo.
pause
