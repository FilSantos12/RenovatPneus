Crie um sistema web completo para uma pequena empresa de pneus chamada
"Renovat Pneus", voltado para uso em rede interna (localhost).
O sistema deve ser SIMPLES, VISUAL e INTUITIVO para usuários sem
experiência com sistemas digitais.

Deve funcionar perfeitamente em DESKTOP, TABLET e MOBILE,
com leitura de código de barras via câmera do celular.

════════════════════════════════════════
 IDENTIDADE VISUAL
════════════════════════════════════════

Nome da empresa: Renovat Pneus
Paleta de cores:
  - Primária:    Preto         (#111111) — remetendo a pneus
  - Secundária:  Laranja       (#F97316) — energia e ação
  - Fundo:       Cinza claro   (#F5F5F5)
  - Texto:       Cinza escuro  (#2D2D2D)
  - Sucesso:     Verde         (#22C55E)
  - Alerta:      Vermelho      (#EF4444)
  - Aviso:       Amarelo       (#FBBF24)

Tipografia:
  - Títulos: Barlow Condensed Bold ou Bebas Neue
  - Corpo:   DM Sans ou Nunito

Ícones: grandes, simples, estilo outline ou filled
Botões: grandes, texto claro, border-radius 12px, mínimo 48px altura
Espaçamento: generoso, sem poluição visual

════════════════════════════════════════
 BREAKPOINTS RESPONSIVOS
════════════════════════════════════════

Desktop:  1440px — layout completo com sidebar lateral
Notebook: 1024px — sidebar colapsada (só ícones)
Tablet:   768px  — menu hamburguer, layout em 2 colunas
Mobile:   390px  — menu hamburguer, layout em 1 coluna,
                   botões full-width, touch-friendly

Regras gerais de responsividade:
  - Tabelas viram cards empilhados no mobile
  - Formulários em coluna única no mobile
  - Botões de ação fixos no rodapé (sticky bottom) no mobile
  - Fontes mínimas: 16px para inputs (evita zoom no iOS)
  - Áreas de toque mínimas: 48x48px
  - Header mobile: logo centralizada + hamburguer + avatar do usuário
  - Menu drawer desliza da esquerda no mobile/tablet

════════════════════════════════════════
 TELA 1 — LOGIN
════════════════════════════════════════

Tela centralizada, dividida em 2 colunas no desktop:
  - Esquerda: painel visual com logo grande da Renovat Pneus,
    fundo preto com textura sutil de pneu (padrão geométrico),
    frase de boas-vindas ("Bem-vindo de volta")
  - Direita: formulário de login em fundo branco

Campos do formulário:
  - Usuário (campo de texto, ícone de pessoa)
  - Senha (campo de senha com botão olho para mostrar/ocultar)
  - Checkbox "Manter conectado"
  - Botão [Entrar] — laranja, tamanho grande, full-width

Estados do formulário:
  - Default, Loading (spinner no botão), Erro (campos vermelhos
    com mensagem: "Usuário ou senha incorretos")

No mobile: apenas o formulário, com logo acima centralizada.

Após login, redirecionar para Dashboard.
Sessão com timeout configurável (ex: 8 horas).

Logout:
  - Botão de logout no menu lateral (desktop) e no menu drawer
    (mobile/tablet), no final da lista de navegação
  - Confirmação: modal perguntando "Deseja realmente sair?"
  - Após logout: volta para a tela de Login

════════════════════════════════════════
 TELA 2 — DASHBOARD (Tela Inicial)
════════════════════════════════════════

Header com: logo, nome da tela, nome do usuário logado + avatar
            e indicador de nível de acesso (badge: ADM ou OPERADOR)

Cards de resumo (grid 2x2 no mobile, 4 colunas no desktop):
  - Estoque Total (ícone pneu, número grande)
  - Entradas Hoje (ícone seta para baixo, verde)
  - Saídas Hoje (ícone seta para cima, laranja)
  - Estoque Baixo (ícone alerta, vermelho — mostra quantidade
    de produtos abaixo do mínimo)

Atalhos rápidos (botões grandes com ícone + texto):
  - [+ Registrar Entrada]
  - [- Registrar Saída]
  - [📷 Ler Código de Barras]  ← atalho mobile destacado
  - [🏷️ Imprimir Etiqueta]
  - [📦 Ver Estoque]

Gráfico de barras simples: entradas x saídas dos últimos 7 dias.

Seção "Últimas Movimentações" (5 linhas recentes):
  data | produto | tipo (entrada/saída) | quantidade | operador

Visibilidade por nível:
  - OPERADOR: vê o dashboard normalmente, sem dados financeiros
  - ADM: vê tudo, incluindo link para Usuários e Relatórios completos

════════════════════════════════════════
 TELA 3 — LEITURA DE CÓDIGO DE BARRAS (mobile-first)
════════════════════════════════════════

Tela otimizada para uso no celular em galpão/loja.

Área central com câmera ativa (viewfinder com moldura laranja animada).
Linha de scan animada deslizando de cima para baixo.

Instruções simples acima: "Aponte a câmera para o código de barras"

Após leitura bem-sucedida:
  - Feedback sonoro (bip) e vibração
  - Card desliza de baixo com informações do produto:
      nome, medida, marca, estoque atual
  - Dois botões grandes em destaque:
      [✅ Registrar ENTRADA]   (verde, metade da tela)
      [❌ Registrar SAÍDA]    (vermelho, metade da tela)

Após escolha (Entrada ou Saída):
  - Campo numérico grande para digitar quantidade
  - Campo de observação (opcional)
  - Botão [Confirmar] — full-width, cor correspondente
  - Opção "Ler outro produto" para voltar à câmera

Fallback manual (código não lido pela câmera):
  - Botão [Digitar código manualmente] → abre teclado numérico
    em modal com campo grande

No desktop/tablet: tela mostra instrução para usar pelo celular,
mas oferece campo de texto para digitar/colar o código
com suporte a leitores USB de código de barras.

════════════════════════════════════════
 TELA 4 — ESTOQUE (Lista de Produtos)
════════════════════════════════════════

Desktop: tabela com colunas:
  Código | Descrição | Medida | Marca | Qtd. | Mín. | Status | Ações

Mobile/Tablet: cards empilhados com as mesmas informações.
Cada card mostra: nome do produto, medida, marca,
badge de status (OK / BAIXO / ZERADO) e botões de ação.

Filtros no topo: busca por nome/código, filtrar por medida,
filtrar por marca, filtrar por status de estoque.

Indicador visual de estoque por linha/card:
  - Verde:    estoque normal
  - Amarelo:  abaixo do mínimo
  - Vermelho: zerado

Botões de ação por item: [Ver] [Editar] [Etiqueta]
Botão principal: [+ Cadastrar Novo Pneu]

Permissões:
  - OPERADOR: pode ver e gerar etiquetas, não pode excluir
  - ADM: acesso total, pode editar, excluir e cadastrar

════════════════════════════════════════
 TELA 5 — REGISTRAR ENTRADA
════════════════════════════════════════

Formulário limpo em etapas:

Etapa 1 — Identificar produto:
  - Campo de busca por nome ou código (autocomplete)
  - Botão [📷 Escanear código] → abre câmera (mobile) ou aguarda
    leitor USB (desktop)
  - Prévia do produto selecionado aparece à direita (desktop)
    ou abaixo do campo (mobile): código, descrição, estoque atual

Etapa 2 — Dados da entrada:
  - Quantidade entrando (campo numérico grande)
  - Fornecedor (texto livre ou seleção de lista)
  - Data de entrada (automática, editável)
  - Observações (opcional)

Etapa 3 — Confirmação:
  - Resumo visual da operação antes de confirmar
  - Botão [✅ Confirmar Entrada] — grande, laranja
  - Após confirmação: mensagem de sucesso + opção de imprimir
    etiqueta ou registrar nova entrada

No mobile: etapas em telas sequenciais com navegação
[Anterior] [Próximo] [Confirmar]

════════════════════════════════════════
 TELA 6 — REGISTRAR SAÍDA
════════════════════════════════════════

Mesmo layout da Entrada, com adaptações:

  - Cor principal: vermelho suave (#EF4444) para diferenciar visualmente
  - Campo "Destino / Cliente" no lugar de "Fornecedor"
  - Alerta automático se quantidade solicitada > estoque disponível:
      banner vermelho: "Atenção: estoque insuficiente!
      Disponível: X unidades."
  - Botão final: [✅ Confirmar Saída] em vermelho
  - Leitura por câmera disponível igual à entrada

════════════════════════════════════════
 TELA 7 — ETIQUETAS
════════════════════════════════════════

Desktop — layout 2 colunas:
  - Esquerda: formulário de configuração
  - Direita: prévia da etiqueta em tempo real

Mobile/Tablet — layout em coluna única:
  - Formulário > toggle "Ver prévia" que expande/colapsa

Campos:
  - Nome do produto
  - Medida do pneu (ex: 175/70 R13)
  - Marca
  - Código interno (gerado automaticamente)
  - Código de barras (gerado a partir do código interno)
  - Preço (opcional)
  - Logo da empresa (toggle on/off)

Opções de tamanho: Pequena (5x3cm) | Média (10x5cm) | Grande (10x8cm)

Prévia fiel ao que será impresso (escala real com régua visual).

Botão [🖨️ Imprimir Etiqueta] — destaque total, full-width no mobile
Opção: número de cópias a imprimir.

Nota: impressão disponível apenas quando conectado a impressora
na rede local. Exibir aviso se impressora não detectada.

════════════════════════════════════════
 TELA 8 — HISTÓRICO / RELATÓRIOS
════════════════════════════════════════

Desktop: tabela de movimentações com filtros no topo.
Mobile: cards empilhados com filtros em drawer lateral.

Colunas/campos: data, produto, tipo (entrada/saída),
quantidade, responsável, observação.

Filtros: intervalo de datas, produto, tipo, operador responsável.

Gráfico de barras: movimentações dos últimos 7/30 dias
(toggle para alternar período).

Botões de exportação: [📥 Exportar PDF] [📊 Exportar Excel]

Permissões:
  - OPERADOR: vê apenas suas próprias movimentações
  - ADM: vê todas as movimentações de todos os operadores

════════════════════════════════════════
 TELA 9 — GERENCIAR USUÁRIOS (somente ADM)
════════════════════════════════════════

Acesso restrito: visível no menu apenas para usuários com
nível ADM. Se OPERADOR tentar acessar a URL diretamente,
exibir tela de "Acesso Negado" com mensagem amigável
e botão [Voltar ao Início].

Lista de usuários cadastrados:
Desktop: tabela com colunas:
  Nome | Usuário (login) | Nível | Status (Ativo/Inativo) | Ações

Mobile: cards com as mesmas informações.

Botão: [+ Cadastrar Novo Usuário]

Formulário de criação/edição de usuário:
  - Nome completo
  - Nome de usuário (login) — sem espaços, minúsculo
  - Senha (com confirmação)
  - Nível de acesso:
      🔴 ADM      — acesso total ao sistema
      🟡 OPERADOR — apenas entrada, saída, estoque e etiquetas
  - Status: Ativo / Inativo (toggle)

Detalhamento dos níveis:

  OPERADOR pode:
    ✅ Fazer login
    ✅ Ver dashboard (sem dados financeiros)
    ✅ Ver estoque
    ✅ Registrar entrada e saída
    ✅ Escanear código de barras
    ✅ Gerar e imprimir etiquetas
    ✅ Ver histórico (apenas suas ações)
    ❌ Cadastrar/editar/excluir produtos
    ❌ Gerenciar usuários
    ❌ Ver relatórios completos
    ❌ Exportar dados

  ADM pode:
    ✅ Tudo que o OPERADOR pode
    ✅ Cadastrar, editar e excluir produtos
    ✅ Gerenciar usuários (criar, editar, desativar)
    ✅ Ver histórico completo de todos os usuários
    ✅ Exportar relatórios em PDF e Excel
    ✅ Configurar estoque mínimo por produto
    ✅ Ver dados do sistema (logs de acesso)

Ação de exclusão: desativa o usuário (nunca exclui do banco),
exibindo badge "Inativo" na lista.
Modal de confirmação antes de desativar.

Badge de nível visível em toda a interface (header):
  - ADM:      badge preto com texto branco
  - OPERADOR: badge laranja com texto branco

════════════════════════════════════════
 COMPONENTES GLOBAIS
════════════════════════════════════════

Menu lateral — Desktop (sidebar):
  - Logo Renovat Pneus no topo
  - Avatar + nome do usuário + badge de nível
  - Links com ícone + texto:
      Dashboard | Escanear | Estoque | Entrada |
      Saída | Etiquetas | Histórico | Usuários (só ADM)
  - Botão Logout no final, com ícone de saída
  - Versão colapsada em 1024px (só ícones com tooltip)

Menu Drawer — Mobile/Tablet:
  - Desliza da esquerda com overlay escuro no fundo
  - Mesmos itens do sidebar
  - Fecha ao clicar fora ou no X
  - Swipe para fechar (gesture)

Header Mobile:
  - Hamburguer à esquerda
  - Logo centralizada
  - Avatar do usuário à direita (abre mini-menu: Perfil, Logout)

Modal de confirmação padrão:
  - Overlay semitransparente
  - Card centralizado com ícone, título, mensagem e 2 botões
  - [Cancelar] (cinza) e [Confirmar] (laranja ou vermelho)

Notificações (toast):
  - Canto superior direito no desktop
  - Topo centralizado no mobile
  - Verde: sucesso | Vermelho: erro | Amarelo: aviso
  - Desaparece após 4 segundos com barra de progresso

Tela de Acesso Negado:
  - Ícone de cadeado grande
  - Mensagem: "Você não tem permissão para acessar esta página"
  - Botão [Voltar ao Início]

Estado vazio (sem dados):
  - Ilustração simples relacionada ao contexto
  - Mensagem amigável sem jargão técnico
  - Botão de ação contextual

════════════════════════════════════════
 ESTILO DOS COMPONENTES
════════════════════════════════════════

Cards:
  - Fundo branco, sombra suave
  - Border-radius 16px, padding 24px
  - Ícone colorido no topo esquerdo

Tabelas (desktop):
  - Linhas alternadas (branco / #F9F9F9)
  - Hover suave nas linhas
  - Cabeçalho fixo com fundo #111111 e texto branco

Formulários:
  - Labels em bold acima dos campos (sempre visíveis)
  - Borda 2px, foco em laranja (#F97316)
  - Campos grandes (mínimo 52px altura) para facilitar toque

Inputs numéricos (quantidade):
  - Botões [−] e [+] visíveis ao lado do número
  - Números grandes e legíveis
  - Teclado numérico ativado automaticamente no mobile

════════════════════════════════════════
 DELIVERABLES ESPERADOS NO FIGMA
════════════════════════════════════════

1. Design System documentado:
   - Paleta de cores com uso de cada cor
   - Tipografia (escala de tamanhos)
   - Espaçamentos e grid
   - Componentes base com variantes e estados

2. Telas em 3 breakpoints cada (Desktop 1440px, Tablet 768px,
   Mobile 390px):
   - Tela 1:  Login
   - Tela 2:  Dashboard
   - Tela 3:  Leitor de Código de Barras
   - Tela 4:  Estoque
   - Tela 5:  Registrar Entrada
   - Tela 6:  Registrar Saída
   - Tela 7:  Etiquetas
   - Tela 8:  Histórico / Relatórios
   - Tela 9:  Gerenciar Usuários (visão ADM)
   - Tela 10: Acesso Negado (visão OPERADOR tentando acessar ADM)

3. Fluxo de navegação interativo (Prototype):
   - Fluxo ADM: login → dashboard → todas as telas
   - Fluxo OPERADOR: login → dashboard → telas permitidas
   - Fluxo mobile: login → scanner → entrada/saída

4. Estados de interface:
   - Login com erro
   - Formulário com validação
   - Estoque baixo / zerado
   - Scanner ativo / produto encontrado / produto não encontrado
   - Toast de sucesso e erro
   - Modal de confirmação

════════════════════════════════════════
 OBSERVAÇÕES FINAIS
════════════════════════════════════════

Os usuários são mecânicos e atendentes sem experiência digital.
Toda ação deve ser clara sem precisar de treinamento.
No mobile o foco é VELOCIDADE: escanear → confirmar em 3 toques.
Mensagens de erro sempre em linguagem humana, nunca técnica.
Se houver dúvida entre simples e completo: escolha SIMPLES.