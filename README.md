# Passe

Mercado de jogadores de uma liga de futebol fictícia: cadastro de jogadores e clubes, compra e venda com contrato de fidelidade, histórico de transações, escalação, partidas e classificação.

Projeto desenvolvido para o Estudo de Caso da vaga SENAI/PE – CÓD. 237 DESENVOLVEDOR I (FULLSTACK).

- **Origem da API:** `http://localhost:3000`
- **URL do frontend:** `http://localhost:3001`

## 1. Pré-requisitos

| Ferramenta | Versão |
| --- | --- |
| Node.js (com npm) | 22 LTS |
| Docker Engine com Docker Compose v2 | 27 ou superior |
| PostgreSQL | 16 (imagem `postgres:16-alpine`, iniciada pelo Docker Compose) |

## 2. Banco de dados

_A preencher._

### Criar o banco

```text
# Na raiz do repositório
docker compose up -d db
```

### Recriar o banco do zero

_A preencher._

## 3. Instalar e executar

### Backend

```text
# Banco de dados (na raiz do repositório)
docker compose up -d db

# Backend (na pasta backend)
cd backend
cp .env.example .env
npm ci
npm run build
npm run start:prod
# API em http://localhost:3000 (o script da banca acrescenta /api/v1)
```

Comandos de qualidade, na pasta `backend`:

```text
npm test              # testes unitários
npm run test:e2e      # testes de ponta a ponta (exigem o banco no ar)
npm run lint          # ESLint
npm run format:check  # Prettier, só verifica
```

### Frontend

_A preencher._

## 4. Variáveis de ambiente

Cada parte tem o seu arquivo `.env.example`, que deve ser copiado para `.env`.

### Backend (`backend/.env.example`)

| Variável | Descrição | Valor de exemplo |
| --- | --- | --- |
| `DATABASE_URL` | Conexão com o PostgreSQL | `postgresql://passe:passe@localhost:5433/passe` |
| `PORT` | Porta da API | `3000` |
| `CORS_ORIGIN` | Origem do frontend liberada no CORS | `http://localhost:3001` |

### Frontend (`frontend/.env.example`)

| Variável | Descrição | Valor de exemplo |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Origem da API, sem `/api/v1` | `http://localhost:3000` |

## 5. Estrutura de pastas e bibliotecas

### Estrutura de pastas

```text
.
├── backend/             API REST (NestJS, Prisma)
├── frontend/            Interface (Next.js, MUI)
└── docker-compose.yml   Banco de dados PostgreSQL

backend/
├── prisma/schema.prisma   Schema do banco
├── src/
│   ├── main.ts            Inicialização da API
│   ├── app.setup.ts       Prefixo /api/v1 e CORS
│   ├── app.module.ts      Módulo raiz
│   ├── config/            Leitura e validação das variáveis de ambiente
│   ├── common/            Filtro de erros, pipes de validação e log de requisições
│   └── prisma/            Acesso ao banco
└── test/                  Testes de ponta a ponta
```

### Bibliotecas

#### Backend

| Biblioteca | Motivo |
| --- | --- |
| NestJS (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) | Framework da API REST, da stack obrigatória |
| `reflect-metadata` e `rxjs` | Dependências exigidas pelo NestJS |
| `@nestjs/config` | Leitura das variáveis de ambiente do `.env`, com validação na inicialização |
| `class-validator` e `class-transformer` | Validação declarativa dos dados de entrada nos DTOs |
| Prisma (`prisma` e `@prisma/client`) | ORM, migrations e acesso ao PostgreSQL |
| Jest, `ts-jest`, `supertest` e `@nestjs/testing` | Testes unitários e de ponta a ponta |
| ESLint (`eslint`, `typescript-eslint`, `@eslint/js`, `@eslint/eslintrc`, `globals`) | Análise estática do código |
| Prettier (`prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`) | Formatação do código |
| TypeScript e ferramentas de build (`typescript`, `ts-node`, `ts-loader`, `tsconfig-paths`, `source-map-support`, `@nestjs/cli`, `@nestjs/schematics`) | Compilação e execução do projeto |
| Tipos (`@types/node`, `@types/express`, `@types/jest`, `@types/supertest`) | Tipagem das bibliotecas |

#### Frontend

_A preencher._

## 6. Decisões e premissas

- O PostgreSQL do Docker Compose é publicado na porta `5433` da máquina, para não conflitar com um PostgreSQL já instalado na porta padrão.
- A API usa a porta `3000` e o frontend, a `3001`.

## 7. Funcionalidades não implementadas

_A preencher._

## 8. Uso de inteligência artificial

_A preencher._
