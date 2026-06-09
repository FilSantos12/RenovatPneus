@echo off
set MYSQLDUMP=C:\laragon\bin\mysql\mysql-8.0\bin\mysqldump.exe
set BACKUP_DIR=C:\RenovatPneus\backups
set DATE_STR=%date:~6,4%-%date:~3,2%-%date:~0,2%

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

if not exist "%MYSQLDUMP%" (
    echo ERRO: mysqldump nao encontrado em %MYSQLDUMP%
    exit /b 1
)

"%MYSQLDUMP%" -u root renovatpneus > "%BACKUP_DIR%\backup_%DATE_STR%.sql"

if %errorLevel% neq 0 (
    echo ERRO: Falha ao gerar backup.
    exit /b 1
)

forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -30 /c "cmd /c del @path" >nul 2>&1

echo Backup concluido: %BACKUP_DIR%\backup_%DATE_STR%.sql
