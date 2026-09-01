# Sistema de Controle Financeiro - Backend

## AC1 - Cadastro de Movimentacoes

## Objetivo

A AC1 estabelece a API para organizar dados financeiros por carteira, cadastrar categorias e registrar receitas e despesas com persistencia no MongoDB.

## Funcionalidades

- API REST com prefixo `/api`, CORS e validacao global de DTOs.
- Cadastro, consulta, edicao e exclusao de carteiras.
- Criacao automatica de categorias padrao por carteira.
- Cadastro e listagem de categorias por carteira e por tipo.
- Cadastro de receitas e despesas com validacao de categoria, valor e data.
- Persistencia em MongoDB por meio do Mongoose.

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
  common/      Tipos e utilitarios compartilhados
```

## Entregas academicas

### AC1 - Cadastro de Movimentacoes

Estrutura inicial, carteiras, categorias, receitas, despesas, validacoes e persistencia inicial no MongoDB.

Status: concluida.

Status da AC1: concluida.

## AC2 - Historico de Movimentacoes

- Listagem paginada de movimentacoes por carteira.
- Busca por descricao.
- Filtros por tipo, categoria e periodo.
- Consulta, atualizacao e exclusao de movimentacoes.

Status da AC2: concluida.

### AC2 - Historico de Movimentacoes

Historico, filtros, edicao e exclusao de movimentacoes pela API.

Status: concluida.
