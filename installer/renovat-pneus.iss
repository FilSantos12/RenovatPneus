; RenovatPneus - Script de instalacao Inno Setup
; Gera o instalador .exe para Windows 10/11
;
; PRE-REQUISITOS PARA GERAR O INSTALADOR:
;   1. Baixar e instalar o Inno Setup: https://jrsoftware.org/isdl.php
;   2. Baixar o NSSM: https://nssm.cc/download
;      e colocar o nssm.exe em: installer\tools\nssm.exe
;   3. Fazer o build do frontend: cd frontend && npm run build
;   4. Abrir este arquivo no Inno Setup e clicar em Build > Compile

#define AppName "RenovatPneus"
#define AppVersion "1.0.0"
#define AppPublisher "RenovatPneus"
#define AppURL "http://localhost"
#define InstallDir "C:\RenovatPneus"

[Setup]
AppId={{F4A2B8C1-3D5E-4F7A-9B2C-1D3E5F7A9B2C}}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
DefaultDirName={#InstallDir}
DefaultGroupName={#AppName}
OutputDir=dist
OutputBaseFilename=RenovatPneus-Setup-v{#AppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
PrivilegesRequired=admin
MinVersion=10.0
WizardStyle=modern

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na Area de Trabalho"; GroupDescription: "Icones adicionais:"
Name: "backuptask"; Description: "Configurar backup automatico diario"; GroupDescription: "Funcionalidades opcionais:"; Checked: yes

[Files]
; Build do frontend (gerado por: cd frontend && npm run build)
Source: "..\frontend\dist\*"; DestDir: "{app}\frontend"; Flags: recursesubdirs

; Backend Laravel completo (inclui vendor/)
Source: "..\backend\*"; DestDir: "{app}\backend"; Flags: recursesubdirs ignoreversion
; Excluir arquivos desnecessarios em producao
Source: "..\backend\.env.example"; DestDir: "{app}\backend"; DestName: ".env"; Flags: ignoreversion onlyifdoesntexist

; Scripts de manutencao
Source: "..\scripts\*"; DestDir: "{app}\scripts"; Flags: ignoreversion

; NSSM — necessario para registrar o servico Windows
; Baixar em: https://nssm.cc/download e colocar em installer\tools\nssm.exe
Source: "tools\nssm.exe"; DestDir: "{app}\scripts"; Flags: ignoreversion

[Icons]
; Menu Iniciar
Name: "{group}\Abrir {#AppName}"; Filename: "{app}\scripts\abrir-sistema.bat"; IconFilename: "{app}\scripts\abrir-sistema.bat"
Name: "{group}\Desinstalar {#AppName}"; Filename: "{uninstallexe}"

; Area de trabalho (opcional)
Name: "{commondesktop}\{#AppName}"; Filename: "{app}\scripts\abrir-sistema.bat"; Tasks: desktopicon

[Run]
; Ordem de execucao pos-instalacao:

; 1. Configurar o banco de dados (migrate + seed + key:generate)
Filename: "{app}\scripts\primeiro-uso.bat"; \
    Description: "Configurar banco de dados"; \
    Flags: runascurrentuser waituntilterminated; \
    StatusMsg: "Configurando banco de dados..."

; 2. Registrar o servico Windows (NSSM)
Filename: "{app}\scripts\install-service.bat"; \
    Description: "Instalar servico Windows"; \
    Flags: runascurrentuser waituntilterminated; \
    StatusMsg: "Instalando servico do servidor..."

; 3. Configurar backup diario automatico (opcional, conforme tarefa selecionada)
Filename: "{app}\scripts\setup-backup-task.bat"; \
    Description: "Configurar backup automatico"; \
    Flags: runascurrentuser waituntilterminated; \
    Tasks: backuptask; \
    StatusMsg: "Configurando backup automatico..."

[UninstallRun]
; Remover o servico Windows ao desinstalar
Filename: "{app}\scripts\uninstall-service.bat"; Flags: runascurrentuser waituntilterminated

[Code]
// Verificar se o Laragon esta instalado antes de prosseguir com a instalacao
function InitializeSetup(): Boolean;
begin
  if not DirExists('C:\laragon') then
  begin
    MsgBox(
      'O Laragon nao esta instalado.' + #13#10 +
      'O RenovatPneus requer o Laragon para funcionar.' + #13#10#13#10 +
      'Por favor, instale o Laragon primeiro:' + #13#10 +
      'https://laragon.org/download/' + #13#10#13#10 +
      'Apos instalar o Laragon, execute este instalador novamente.',
      mbError, MB_OK
    );
    Result := False;
  end else
    Result := True;
end;
