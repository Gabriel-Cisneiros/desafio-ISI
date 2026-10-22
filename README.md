# Passe

Mercado de jogadores de uma liga de futebol fictícia: cadastro de jogadores e clubes, compra e venda com contrato de fidelidade, histórico de transações, escalação, partidas e classificação.

Projeto desenvolvido para o Estudo de Caso da vaga SENAI/PE – CÓD. 237 DESENVOLVEDOR I (FULLSTACK).

- **Origem da API:** `http://localhost:3000`
- **URL do frontend:** `http://localhost:3001`
- **Documentação da API (Swagger):** `http://localhost:3000/api/docs`

## 1. Pré-requisitos

| Ferramenta | Versão |
| --- | --- |
| Node.js (com npm) | 22 LTS |
| Docker Engine com Docker Compose v2 | 27 ou superior |
| PostgreSQL | 16 (imagem `postgres:16-alpine`, iniciada pelo Docker Compose) |

## 2. Banco de dados

O banco é um PostgreSQL 16 em contêiner, e as tabelas são criadas pelas migrations versionadas em `backend/prisma/migrations`. O banco criado por esses passos começa vazio, sem jogadores, clubes, transações nem partidas.

### Criar o banco

```text
# Na raiz do repositório
docker compose up -d --wait db

# Na pasta backend
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
```

### Recriar o banco do zero

Apaga todas as tabelas e dados e aplica as migrations de novo, deixando o banco vazio. Com o banco no ar, na pasta `backend`:

```text
npx prisma migrate reset --force
```

## 3. Instalar e executar

### Backend

```text
# Banco de dados (na raiz do repositório)
docker compose up -d --wait db

# Backend (na pasta backend)
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
npm run build
npm run start:prod
# API em http://localhost:3000 (o script da banca acrescenta /api/v1)
# Documentação interativa em http://localhost:3000/api/docs
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
├── frontend/            Interface (Next.js, Tailwind CSS, shadcn/ui)
└── docker-compose.yml   Banco de dados PostgreSQL

backend/
├── prisma/schema.prisma   Schema do banco
├── src/
│   ├── main.ts            Inicialização da API
│   ├── app.setup.ts       Prefixo /api/v1 e CORS
│   ├── app.module.ts      Módulo raiz
│   ├── config/            Leitura e validação das variáveis de ambiente
│   ├── common/            Filtro de erros, pipes de validação, log de requisições, regras de negócio e enums
│   ├── docs/              Configuração da documentação Swagger
│   ├── prisma/            Acesso ao banco
│   └── modules/           Módulos de domínio: players, clubs, market, lineups e matches
│       └── <módulo>/
│           ├── *.controller.ts, *.service.ts, *.module.ts
│           ├── dto/          Dados de entrada validados e contratos de resposta para o Swagger
│           ├── interfaces/   Formato das respostas
│           ├── selects/      Campos lidos do banco (select do Prisma) e os tipos derivados
│           ├── mappers/      Conversão dos registros do banco para as respostas
│           └── utils/        Funções de apoio do módulo, como ordenação, filtros e buscas comuns
└── test/                  Testes de ponta a ponta

frontend/src/
├── app/                   Rotas do App Router (uma pasta por tela)
├── components/
│   ├── layout/            Menu lateral e navegação
│   └── ui/                Componentes do shadcn/ui
├── hooks/
│   ├── use-api-query.ts   Consulta à API com carregamento, erro e recarga
│   ├── use-api-action.ts  Ação na API com bloqueio de envio duplo e toast de sucesso ou erro
│   └── data/              Hooks de consulta por recurso (jogadores, clubes, mercado e liga)
├── lib/api/
│   ├── client.ts          Cliente Axios com a origem da API e o prefixo /api/v1
│   ├── errors.ts          Extração do message das respostas de erro
│   ├── services/          Um serviço por recurso
│   └── types/             Tipos das respostas, em snake_case como a API devolve
└── stores/                Store de feedback (toasts) em Zustand
```

### Bibliotecas

#### Backend

| Biblioteca | Motivo |
| --- | --- |
| NestJS (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) | Framework da API REST, da stack obrigatória |
| `reflect-metadata` e `rxjs` | Dependências exigidas pelo NestJS |
| `@nestjs/config` | Leitura das variáveis de ambiente do `.env`, com validação na inicialização |
| `class-validator` e `class-transformer` | Validação declarativa dos dados de entrada nos DTOs |
| Prisma (`prisma` e `@prisma/client`) | ORM, migrations e acesso ao PostgreSQL; o `Decimal` do Prisma também é usado nos cálculos em moedas, sem erro de ponto flutuante |
| `@nestjs/swagger` | Documentação interativa da API (OpenAPI), gerada a partir dos controladores e DTOs |
| Jest, `ts-jest`, `supertest` e `@nestjs/testing` | Testes unitários e de ponta a ponta |
| ESLint (`eslint`, `typescript-eslint`, `@eslint/js`, `@eslint/eslintrc`, `globals`) | Análise estática do código |
| Prettier (`prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`) | Formatação do código |
| TypeScript e ferramentas de build (`typescript`, `ts-node`, `ts-loader`, `tsconfig-paths`, `source-map-support`, `@nestjs/cli`, `@nestjs/schematics`) | Compilação e execução do projeto |
| Tipos (`@types/node`, `@types/express`, `@types/jest`, `@types/supertest`) | Tipagem das bibliotecas |

#### Frontend

| Biblioteca | Motivo |
| --- | --- |
| Next.js (`next`), React (`react`, `react-dom`) | Framework da interface, da stack obrigatória |
| `axios` | Cliente HTTP único para a API, com a origem lida de variável de ambiente |
| `zustand` | Estado global do feedback das ações (toasts de sucesso e de erro) |
| Tailwind CSS (`tailwindcss`, `@tailwindcss/postcss`, `postcss`) | Estilos a partir dos tokens do design system |
| shadcn/ui (`shadcn`, `radix-ui`, `class-variance-authority`, `cn`, `tw-animate-css`) | Componentes acessíveis gerados no projeto e personalizados com os tokens do Figma |
| `lucide-react` | Ícones |
| ESLint (`eslint`, `eslint-config-next`) e Prettier (`prettier`, `eslint-config-prettier`) | Análise estática e formatação |
| TypeScript e tipos (`typescript`, `@types/node`, `@types/react`, `@types/react-dom`) | Tipagem do projeto |

## 6. Decisões e premissas

- O PostgreSQL do Docker Compose é publicado na porta `5433` da máquina, para não conflitar com um PostgreSQL já instalado na porta padrão.
- A API usa a porta `3000` e o frontend, a `3001`.
- Em `GET /players`, os filtros de posição, condição, clube, idade e exclusão são aplicados no banco. A busca pelo nome, a faixa de valor de mercado, a ordenação e a paginação são feitas na API, depois de calcular o valor de mercado de cada jogador com as mesmas funções usadas nas respostas. Assim a fórmula do valor de mercado existe num só lugar, e a busca sem acentos não depende de extensões do PostgreSQL.

## 7. Funcionalidades não implementadas

_A preencher._

## 8. Uso de inteligência artificial

_A preencher._
