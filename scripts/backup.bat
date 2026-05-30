@echo off
:: Backup automatico do banco RenovatPneus
:: Este script e executado diariamente pela Tarefa Agendada do Windows

:: Caminho do mysqldump fornecido pelo Laragon
set MYSQL_PATH=C:\laragon\bin\mysql\mysql-8.0\bin\mysqldump.exe
set BACKUP_DIR=C:\RenovatPneus\backups

:: Formatar data no padrao YYYY-MM-DD para ordenacao correta
set DATE_STR=%date:~6,4%-%date:~3,2%-%date:~0,2%
set BACKUP_FILE=%BACKUP_DIR%\renovat_pneus_%DATE_STR%.sql

:: Criar pasta de backup se ainda nao existir
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Verificar se o mysqldump esta disponivel
if not exist "%MYSQL_PATH%" (
    echo ERRO: mysqldump nao encontrado em %MYSQL_PATH%
    exit /b 1
)

:: Executar o backup — Laragon usa MySQL sem senha por padrao
"%MYSQL_PATH%" -u root renovat_pneus > "%BACKUP_FILE%"

if %errorLevel% neq 0 (
    echo ERRO: Falha ao gerar backup do banco de dados.
    exit /b 1
)

:: Remover backups com mais de 30 dias para economizar espaco
forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -30 /c "cmd /c del @path" >nul 2>&1

echo Backup concluido: %BACKUP_FILE%
