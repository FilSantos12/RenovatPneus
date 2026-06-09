# RenovatPneus v1.0.0 — Guia de Instalação

## Pré-requisito

Nenhum. O instalador configura tudo automaticamente.

## Instalação

1. Execute `RenovatPneus_v1.0.0_Setup.exe` como **Administrador**
2. Siga o assistente (Próximo → Próximo → Instalar)
3. Aguarde ~3 minutos para a configuração automática
4. Ao finalizar, acesse: **http://localhost:8000**

## Primeiro acesso

| Campo   | Valor      |
|---------|------------|
| Usuário | `admin`    |
| Senha   | `password` |

⚠️ Troque a senha imediatamente em: **Usuários → Editar**

## Acesso pelos celulares

1. Conecte o celular à mesma rede Wi-Fi da loja
2. No PC: abra o Prompt de Comando e digite `ipconfig`
3. Anote o **Endereço IPv4** (ex: `192.168.1.10`)
4. No celular, abra o Chrome: `http://192.168.1.10:8000`

## Backup

- Automático: todo dia às **02:00** em `C:\RenovatPneus\backups\`
- Manual: execute `C:\RenovatPneus\deploy\scripts\backup.bat`
- Retenção: últimos 30 dias

## Checklist pré-build (para o desenvolvedor)

Antes de compilar o instalador:

```
1. Colocar em deploy/runtime/:
   - php.zip   (PHP 8.2+ Thread Safe x64 — windows.php.net/download)
   - nssm.exe  (nssm.cc/download)

2. Executar deploy/scripts/build.bat
   (copia frontend/dist para backend/public/)

3. Compilar deploy/install.iss no Inno Setup -> Build -> Compile
   Saída: deploy/dist/RenovatPneus_v1.0.0_Setup.exe
```

## Suporte

Desenvolvido por **Filipe Santos**
https://filsantos12.github.io/MyPortifolio/index.html#
