# Sistema Renovat Pneus - Instruções de Uso

## 🎯 Sobre o Sistema

Sistema web completo de gestão de estoque para a empresa "Renovat Pneus", desenvolvido para uso em rede interna (localhost). O sistema é **simples, visual e intuitivo**, projetado especialmente para usuários sem experiência com sistemas digitais.

## 📱 Responsividade

O sistema funciona perfeitamente em:
- **Desktop** (1440px+): Layout completo com sidebar lateral
- **Notebook** (1024px): Sidebar colapsada (somente ícones)
- **Tablet** (768px): Menu hamburguer, layout em 2 colunas
- **Mobile** (390px): Menu hamburguer, layout em 1 coluna, botões full-width

## 🔐 Credenciais de Acesso

### Administrador (ADM)
- **Usuário:** admin
- **Senha:** admin123
- **Permissões:** Acesso total ao sistema

### Operador
- **Usuário:** joao
- **Senha:** joao123
- **Permissões:** Operações básicas (sem gerenciamento de usuários)

## 🎨 Identidade Visual

### Paleta de Cores
- **Preto** (#111111): Cor primária, remetendo a pneus
- **Laranja** (#F97316): Cor secundária, energia e ação
- **Cinza Claro** (#F5F5F5): Fundo
- **Verde** (#22C55E): Sucesso/Entradas
- **Vermelho** (#EF4444): Alerta/Saídas
- **Amarelo** (#FBBF24): Avisos

### Tipografia
- **Títulos:** Barlow Condensed Bold
- **Corpo:** DM Sans

## 📋 Funcionalidades por Tela

### 1. Login
- Autenticação com usuário e senha
- Opção "Manter conectado"
- Feedback visual de erros
- Design responsivo com painel visual no desktop

### 2. Dashboard
- Cards de resumo (Estoque Total, Entradas/Saídas Hoje, Estoque Baixo)
- Atalhos rápidos para ações principais
- Gráfico de movimentações dos últimos 7 dias
- Lista das últimas 5 movimentações

### 3. Leitor de Código de Barras
- Interface otimizada para mobile
- Simulação de leitura de código de barras
- Opção para digitar código manualmente
- Fluxo rápido: escanear → escolher tipo → confirmar quantidade

### 4. Estoque
- Listagem completa de produtos
- Filtros por busca, marca e status
- Indicadores visuais de estoque (OK/Baixo/Zerado)
- Tabela no desktop, cards no mobile
- Ações: Ver, Editar (ADM), Imprimir Etiqueta

### 5. Registrar Entrada
- Busca de produto por nome/código
- Scanner de código de barras
- Formulário em etapas
- Confirmação visual antes de registrar

### 6. Registrar Saída
- Mesmo fluxo da entrada
- Alerta de estoque insuficiente
- Validação de quantidade disponível
- Cor vermelha para diferenciação visual

### 7. Etiquetas
- Configuração de informações do produto
- Prévia em tempo real
- 3 tamanhos disponíveis (Pequena, Média, Grande)
- Opção de incluir logo e preço
- Número de cópias configurável

### 8. Histórico/Relatórios
- Listagem de todas as movimentações
- Filtros por tipo, data e operador
- Exportação em PDF e Excel (somente ADM)
- Operadores veem apenas suas movimentações

### 9. Gerenciar Usuários (ADM)
- Listagem de usuários cadastrados
- Criação de novos usuários
- Edição e desativação
- Dois níveis de acesso: ADM e OPERADOR
- Explicação clara das permissões de cada nível

### 10. Acesso Negado
- Tela amigável para usuários sem permissão
- Botão para voltar ao início

## 👥 Níveis de Permissão

### OPERADOR
✅ **Pode:**
- Ver dashboard (sem dados financeiros)
- Ver estoque
- Registrar entrada e saída
- Escanear código de barras
- Gerar e imprimir etiquetas
- Ver histórico (apenas suas ações)

❌ **Não pode:**
- Cadastrar/editar/excluir produtos
- Gerenciar usuários
- Ver relatórios completos
- Exportar dados

### ADM
✅ **Pode fazer tudo**, incluindo:
- Gerenciar usuários
- Ver histórico completo
- Exportar relatórios
- Configurar estoque mínimo

## 🎯 Fluxo Recomendado (Mobile)

1. **Login** → Entrar com credenciais
2. **Dashboard** → Ver resumo do estoque
3. **Scanner** → Ler código de barras do produto
4. **Escolher** → Entrada ou Saída
5. **Confirmar** → Quantidade e detalhes
6. **Concluído** → Operação registrada!

**Total: 3 toques para registrar uma movimentação!**

## 💡 Dicas de Uso

- **Mobile:** Use o scanner de código de barras para agilizar o processo
- **Desktop:** Utilize atalhos do teclado e busca rápida
- **Estoque Baixo:** O sistema alerta automaticamente produtos abaixo do mínimo
- **Histórico:** Acompanhe todas as movimentações em tempo real
- **Etiquetas:** Gere etiquetas com códigos de barras para facilitar leituras futuras

## 🔧 Recursos Técnicos

- **Framework:** React com TypeScript
- **Roteamento:** React Router v7
- **Estilização:** Tailwind CSS v4
- **Ícones:** Lucide React
- **Gráficos:** Recharts
- **Animações:** Motion (Framer Motion)
- **Notificações:** Sonner (Toast)
- **Formulários:** React Hook Form
- **Datas:** date-fns

## 📱 Touch-Friendly

Todos os elementos interativos têm:
- Mínimo de **48x48px** de área de toque
- Botões grandes e espaçados
- Feedback visual ao toque
- Inputs com tamanho mínimo de **16px** (evita zoom no iOS)

## 🎨 Design System

O sistema segue rigorosamente as especificações do documento:
- Botões com **border-radius 12px** e altura mínima de **48px**
- Cards com **border-radius 16px** e padding **24px**
- Espaçamento generoso, sem poluição visual
- Ícones grandes e simples
- Hierarquia visual clara

## 🚀 Próximos Passos

Para usar o sistema em produção com banco de dados real, considere:
- Integrar com Supabase para persistência de dados
- Implementar autenticação JWT
- Adicionar suporte a câmera real para leitura de códigos de barras
- Integrar com impressoras térmicas para etiquetas
- Implementar backups automáticos

---

**Desenvolvido com ❤️ para a Renovat Pneus**
