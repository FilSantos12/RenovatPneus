@echo off
title RenovatPneus - Instalando Servico Laravel
echo.
echo ================================================
echo  RenovatPneus - Instalando servico do servidor
echo ================================================
echo.

:: Verificar se esta rodando como Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRO: Execute este script como Administrador.
    echo Clique com botao direito ^> Executar como administrador
    pause
    exit /b 1
)

:: Definir caminhos
set PROJECT_DIR=%~dp0..
set BACKEND_DIR=%PROJECT_DIR%\backend
set PHP_PATH=C:\laragon\bin\php\php-8.2\php.exe
set NSSM_PATH=%~dp0nssm.exe

:: Verificar se o PHP do Laragon existe
if not exist "%PHP_PATH%" (
    echo ERRO: PHP nao encontrado em %PHP_PATH%
    echo Verifique se o Laragon esta instalado corretamente.
    pause
    exit /b 1
)

:: Verificar se o NSSM existe
if not exist "%NSSM_PATH%" (
    echo ERRO: nssm.exe nao encontrado em %NSSM_PATH%
    echo Coloque o nssm.exe na pasta scripts\ antes de continuar.
    pause
    exit /b 1
)

:: Parar e remover servico anterior se ja existir
echo Removendo servico anterior (se existir)...
"%NSSM_PATH%" stop RenovatPneusAPI >nul 2>&1
"%NSSM_PATH%" remove RenovatPneusAPI confirm >nul 2>&1

:: Instalar o servico apontando para php artisan serve
echo Registrando servico Windows...
"%NSSM_PATH%" install RenovatPneusAPI "%PHP_PATH%"
"%NSSM_PATH%" set RenovatPneusAPI AppParameters "artisan serve --host=0.0.0.0 --port=8000"
"%NSSM_PATH%" set RenovatPneusAPI AppDirectory "%BACKEND_DIR%"
"%NSSM_PATH%" set RenovatPneusAPI DisplayName "RenovatPneus - Servidor API"
"%NSSM_PATH%" set RenovatPneusAPI Description "Servidor local do sistema RenovatPneus"

:: Iniciar automaticamente junto com o Windows
"%NSSM_PATH%" set RenovatPneusAPI Start SERVICE_AUTO_START

:: Reiniciar automaticamente em caso de falha (atraso de 3 segundos)
"%NSSM_PATH%" set RenovatPneusAPI AppRestartDelay 3000

:: Redirecionar logs para a pasta storage do Laravel
"%NSSM_PATH%" set RenovatPneusAPI AppStdout "%BACKEND_DIR%\storage\logs\service-stdout.log"
"%NSSM_PATH%" set RenovatPneusAPI AppStderr "%BACKEND_DIR%\storage\logs\service-stderr.log"

:: Iniciar o servico imediatamente
echo Iniciando servico...
"%NSSM_PATH%" start RenovatPneusAPI

echo.
echo Servico instalado e iniciado com sucesso!
echo O sistema estara disponivel em: http://localhost
echo.
pause
