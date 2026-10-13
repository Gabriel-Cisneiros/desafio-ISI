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

_A preencher._

### Backend

### Frontend

## 4. Variáveis de ambiente

Cada parte tem o seu arquivo `.env.example`, que deve ser copiado para `.env`.

### Backend (`backend/.env.example`)

| Variável | Descrição | Valor de exemplo |
| --- | --- | --- |
| `DATABASE_URL` | Conexão com o PostgreSQL | `postgresql://passe:passe@localhost:5433/passe?schema=public` |
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
```

### Bibliotecas

_A preencher._

## 6. Decisões e premissas

- O PostgreSQL do Docker Compose é publicado na porta `5433` da máquina, para não conflitar com um PostgreSQL já instalado na porta padrão.
- A API usa a porta `3000` e o frontend, a `3001`.

## 7. Funcionalidades não implementadas

_A preencher._

## 8. Uso de inteligência artificial

_A preencher._
