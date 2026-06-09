#define AppName    "RenovatPneus"
#define AppVersion "1.0.0"
#define AppPublisher "Filipe Santos"
#define AppURL     "https://filsantos12.github.io/MyPortifolio/index.html#"
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
OutputBaseFilename=RenovatPneus_v{#AppVersion}_Setup
Compression=lzma2/ultra64
SolidCompression=yes
PrivilegesRequired=admin
MinVersion=10.0
WizardStyle=modern

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na Area de Trabalho"; GroupDescription: "Icones adicionais:"; Checked: yes

[Files]
; Backend Laravel (inclui frontend buildado em public/ — executar build.bat antes)
Source: "..\backend\*"; DestDir: "{app}\backend"; Flags: recursesubdirs ignoreversion
; Arquivos de deploy (scripts, config e runtime — php.zip + nssm.exe devem estar em deploy\runtime\)
Source: "..\deploy\*"; DestDir: "{app}\deploy"; Flags: recursesubdirs ignoreversion

[Dirs]
Name: "{app}\logs"
Name: "{app}\backups"
Name: "{app}\backend\storage\logs"
Name: "{app}\backend\storage\framework\cache"
Name: "{app}\backend\storage\framework\sessions"
Name: "{app}\backend\storage\framework\views"
Name: "{app}\backend\bootstrap\cache"

[Icons]
Name: "{group}\Abrir {#AppName}";       Filename: "http://localhost:8000"
Name: "{group}\Parar Servidor";         Filename: "{app}\deploy\scripts\stop.bat"
Name: "{group}\Iniciar Servidor";       Filename: "{app}\deploy\scripts\start.bat"
Name: "{group}\Desinstalar {#AppName}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#AppName}";     Filename: "http://localhost:8000"; Tasks: desktopicon

[Run]
Filename: "{app}\deploy\scripts\install.bat"; \
    Description: "Configurar e iniciar o sistema"; \
    Flags: runascurrentuser waituntilterminated; \
    StatusMsg: "Configurando o sistema (aguarde ~3 minutos)..."

[UninstallRun]
Filename: "{app}\deploy\scripts\uninstall.bat"; Flags: runascurrentuser waituntilterminated
