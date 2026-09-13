# Changelog

Todas as mudanças notáveis deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/)
(`MAJOR.MINOR.PATCH`).

## [1.1.6] - 2026-09-13

### Added
- Mês contábil configurável: o ADM pode definir, em Configurações, o dia em
  que o "mês" começa (1–31) — usado nos Relatórios e no card "Este mês" das
  Finanças. Padrão (`dia_inicio_mes=1`) mantém o mês calendário normal.
- Tabela `settings` + endpoints `GET`/`PUT /api/settings` (ADM) e
  `GET /api/period/current`.

### Fixed
- `FinanceController` calculava os limites de "mês"/"hoje" com o timezone
  padrão do servidor (UTC) em vez do horário de Brasília — o card "Hoje"
  podia mostrar horas erradas e, perto da virada do mês/ano, incluir ou
  excluir vendas do dia errado.

### Changed
- `RelatoriosPage.tsx` deixou de calcular o período localmente
  (duplicado com o backend) e passou a consumir `/api/period/current`.

## [1.0.6] - 2026-08-06

### Changed
- Filtros de Estoque (busca/marca/status) movidos para server-side —
  antes filtravam só os 15 itens da página atual, deixando a página
  vazia após aplicar um filtro em páginas além da primeira.
- Novo endpoint `GET /api/products/brands` (lista completa de marcas).

### Fixed
- `Product.brand`/`size` tratados como `string | null` no frontend,
  evitando erro ao renderizar produtos sem marca/medida cadastrada.

## [1.0.5] - data não registrada (confirmado retroativamente)

### Fixed
- Erro 500 ao cadastrar usuário sem e-mail — campo `email` passou a
  aceitar `null`.

## [1.0.4] - 2026-06-23

### Fixed
- Chrome Tradutor corrompia o DOM do React (`NotFoundError: removeChild`) —
  adicionado `translate="no"` + `lang="pt-BR"` e meta `notranslate`.
- Busca no Estoque quebrava com `name`/`size` nulos.

## [1.0.3] - 2026-06-23

### Fixed
- Etiquetas não funcionavam para produtos de página 2 em diante.
- `NotFoundError: removeChild` na página Etiquetas (causa estrutural:
  empty-state dentro do `printRef`, corrigido movendo-o para fora).

### Changed
- Busca de produto na venda (Saída) passou a ser server-side com debounce.

## [1.0.2] - 2026-06-17

### Added
- Aba "Serviços" na página de Relatórios.

### Fixed
- Erro 422 ao editar produto.

## [1.0.1] - 2026-06-17

### Fixed
- Paginação de produtos, invalidação de cache do React Query, colisão de
  código de barras, perda de sessão ao dar F5.

## [1.0.0] - 2026-06-12

### Added
- Lançamento inicial: gestão de estoque, entradas/saídas, vendas, serviços,
  etiquetas, scanner USB/HID e câmera, relatórios, instalador standalone
  (PHP bundled + SQLite + NSSM) e HTTPS via stunnel para câmera no celular.
