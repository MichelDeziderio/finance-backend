# Sistema de Controle Financeiro - Backend

## Objetivo

API NestJS para persistir e consultar dados financeiros organizados por carteira.

## Tecnologias

- NestJS
- TypeScript
- MongoDB
- Mongoose

## Como executar

```bash
cp .env.example .env
docker compose up -d
npm install
npm run start:dev
```

A API fica disponivel em `http://localhost:3000/api`.

## Build

```bash
npm run build
```

## Estrutura

```text
src/
  wallets/     Carteiras
  categories/  Categorias
  movements/   Movimentacoes
  dashboard/   Indicadores financeiros
  common/      Tipos e utilitarios compartilhados
```

## Entregas academicas

### AC1 - Cadastro de Movimentacoes

- API REST com CORS e validacao de DTOs.
- Carteiras e categorias padrao por carteira.
- Categorias personalizadas por tipo.
- Cadastro de receitas e despesas.
- Persistencia inicial no MongoDB.

Status: concluida.

### AC2 - Historico de Movimentacoes

- Listagem paginada de movimentacoes.
- Busca por descricao.
- Filtros por tipo, categoria e periodo.
- Consulta, atualizacao e exclusao de movimentacoes.

Status: concluida.

### AC3 - Dashboard Financeiro

- Resumo de receitas, despesas e saldo.
- Despesas por categoria.
- Comparativo de receitas e despesas por data.
- Comparacao com o periodo anterior.
- Filtro de periodo e categoria.
- Ultimas 10 movimentacoes.

Status: concluida.

Status da AC1: concluida.

Status da AC2: concluida.

Status da AC3: concluida.
