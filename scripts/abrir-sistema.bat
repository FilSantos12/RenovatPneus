@echo off
:: Atalho para abrir o RenovatPneus no navegador
:: Aguarda 2 segundos para garantir que o servico esta respondendo
timeout /t 2 /nobreak >nul

:: Abre o sistema no navegador padrao do Windows
start http://localhost

exit
