# Post Like Queue

Projeto full stack para um teste tecnico que simula likes em posts de uma rede social com foco em clareza arquitetural, consistencia sob concorrencia e facilidade de explicacao em apresentacao tecnica.

## Visao geral

O projeto expoe estes endpoints principais:

- `GET /posts` — lista posts
- `POST /posts` — cria post (titulo e conteudo; interface React inclui formulario simples)
- `GET /posts/:id` — detalhe do post
- `POST /posts/:id/likes` — enfileira curtida (nao incrementa no handler HTTP)
- `GET /posts/:id/likes` — quantidade de curtidas
- `GET /posts/ranking/top-liked` — ranking dos mais curtidos

Sobre curtidas duplicadas: antes de enfileirar, a API verifica se ja existe registro em `post_likes` para o mesmo `postId` e `userId`. Se existir, responde `409 Conflict` com mensagem em portugues. A garantia definitiva continua sendo a constraint unica `(post_id, user_id)` no PostgreSQL e o worker idempotente.

O `POST /posts/:id/likes` nao incrementa likes diretamente. Ele recebe a requisicao, valida os dados basicos e publica um job na fila BullMQ. O worker processa o job, grava a curtida no PostgreSQL e incrementa `likes_count` apenas quando a curtida for realmente nova.

## Stack utilizada

### Backend

- Node.js
- TypeScript
- Fastify
- Prisma
- PostgreSQL
- Redis
- BullMQ
- Swagger / OpenAPI

### Frontend

- React
- TypeScript
- Vite

### Infra

- Docker Compose
- Dockerfiles separados para backend e frontend

## Estrutura do projeto

```text
.
|-- backend
|   |-- prisma
|   |   |-- migrations
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- src
|   |   |-- app.ts
|   |   |-- server.ts
|   |   |-- worker.ts
|   |   |-- cache
|   |   |-- config
|   |   |-- controllers
|   |   |-- docs
|   |   |-- lib
|   |   |-- queue
|   |   |-- repositories
|   |   |-- routes
|   |   |-- schemas
|   |   |-- services
|   |   `-- types
|   |-- Dockerfile
|   `-- package.json
|-- frontend
|   |-- src
|   |   |-- components
|   |   |-- pages
|   |   |-- services
|   |   `-- types
|   |-- Dockerfile
|   `-- package.json
|-- docker-compose.yml
`-- README.md
```

## Decisoes tecnicas

### 1. Consistencia dos likes garantida pelo banco

O ponto central da consistencia esta no PostgreSQL:

- tabela `posts` com campo `likes_count`
- tabela `post_likes`
- constraint unica em `(post_id, user_id)`

Isso garante que o mesmo usuario nao consiga curtir o mesmo post mais de uma vez, mesmo com varias requisicoes simultaneas.

### 2. Processamento assincrono com fila

O endpoint de like retorna `202 Accepted` e publica um job na BullMQ.

Motivação:

- desacoplar a API HTTP da escrita final
- absorver rajadas de requisicoes
- deixar o fluxo facil de explicar

### 3. Atualizacao atomica do contador

No worker, a curtida e processada em transacao:

1. tenta inserir em `post_likes`
2. se a insercao for nova, executa `increment: 1` em `posts.likesCount`
3. se houver violacao de unicidade, considera a operacao idempotente e nao incrementa novamente

### 4. Cache simples e objetivo

O projeto cacheia prioritariamente:

- `GET /posts/ranking/top-liked`

Tambem foi incluido cache para:

- `GET /posts/:id`

O cache e invalidado somente quando um like novo e persistido com sucesso.

## Como rodar localmente

### Pre-requisitos

- Node.js 20+
- Docker e Docker Compose

### 1. Instale as dependencias

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 2. Configure variaveis de ambiente

Copie os exemplos abaixo:

- `.env.example` para `.env`
- `backend/.env.example` para `backend/.env`
- `frontend/.env.example` para `frontend/.env`

### 3. Suba PostgreSQL e Redis a partir da raiz do projeto

```bash
cd E:\postlike-queue
docker compose up -d postgres redis
```

Valores padrao do `backend/.env`:

Backend:

```env
PORT=3333
DATABASE_URL=postgresql://postgres:postgres@localhost:55432/postlike_queue?schema=public
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_CACHE_TTL_SECONDS=60
CORS_ORIGIN=http://localhost:5173
```

Valores padrao do `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3333
```

Valores padrao do `.env` da raiz:

```env
POSTGRES_DB=postlike_queue
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=55432
REDIS_PORT=6380
BACKEND_PORT=3333
FRONTEND_PORT=4173
VITE_API_BASE_URL=http://localhost:3333
```

### 4. Gere o client Prisma, aplique a migracao e rode o seed

Se o banco estiver no Docker, o caminho mais confiavel e executar migration e seed pelo proprio container do backend:

```bash
cd E:\postlike-queue
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend npm run prisma:seed
```

Se quiser, voce ainda pode gerar o client localmente:

```bash
cd E:\postlike-queue\backend
npx prisma generate
```

### 5. Rode API, worker e frontend

Para a execucao mais simples, suba tudo pelo Docker:

```bash
cd E:\postlike-queue
docker compose up --build backend worker frontend
```

Se preferir rodar a interface e os processos Node localmente, use em terminais separados:

```bash
cd E:\postlike-queue\backend
npm run dev
```

```bash
cd E:\postlike-queue\backend
npm run dev:worker
```

```bash
cd E:\postlike-queue\frontend
npm run dev
```

## Como rodar com Docker

### 1. Configure o arquivo raiz de ambiente

Copie os arquivos:

- `.env.example` para `.env`
- `backend/.env.example` para `backend/.env`
- `frontend/.env.example` para `frontend/.env`

### 2. Suba banco e Redis

```bash
cd E:\postlike-queue
docker compose up -d postgres redis
```

### 3. Rode migration e seed pelo container do backend

```bash
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend npm run prisma:seed
```

### 4. Suba backend, worker e frontend

```bash
docker compose up --build backend worker frontend
```

Servicos iniciados:

- `postgres`
- `redis`
- `backend`
- `worker`
- `frontend`

## Acessos

- Swagger UI: [http://localhost:3333/docs](http://localhost:3333/docs)
- API: [http://localhost:3333](http://localhost:3333)
- Frontend: [http://localhost:4173](http://localhost:4173)

A interface web esta em portugues; o codigo-fonte permanece em ingles.

## Conectar ao banco com Beekeeper Studio

O [Beekeeper Studio](https://www.beekeeperstudio.io/) e um cliente grafico simples para PostgreSQL. Use para inspecionar tabelas `posts` e `post_likes` durante a demo ou o debug.

### Pre-requisito

O container `postgres` precisa estar rodando e a porta publicada no host precisa bater com o que voce colocar no Beekeeper. No projeto, o padrao no `.env` da raiz e:

- `POSTGRES_PORT=55432` (mapeia `localhost:55432` para `5432` dentro do container)

Isso evita conflito com um PostgreSQL ja instalado na maquina em `5432` ou `5433`.

### Passo a passo no Beekeeper

1. Abra o Beekeeper Studio e clique em **New Connection** (nova conexao).
2. Escolha **Postgres**.
3. Preencha os campos:
   - **Host:** `localhost`
   - **Port:** o valor de `POSTGRES_PORT` do seu `.env` na raiz (ex.: `55432`)
   - **User:** `postgres` (ou o valor de `POSTGRES_USER`)
   - **Password:** `postgres` (ou o valor de `POSTGRES_PASSWORD`)
   - **Default Database:** `postlike_queue` (ou o valor de `POSTGRES_DB`)
4. Deixe **SSL** desligado (ambiente local).
5. Salve e teste a conexao (**Test**).

### Consultas uteis para a apresentacao

```sql
-- Posts e contador de curtidas
SELECT id, title, likes_count, created_at FROM posts ORDER BY created_at DESC;

-- Curtidas individuais (regra de unicidade por post + usuario)
SELECT * FROM post_likes ORDER BY created_at DESC;
```

### Se a autenticacao falhar

- Confirme que o Postgres do projeto esta de pe: `docker compose ps` e veja se `postlike-postgres` esta **healthy**.
- Confirme a porta publicada na coluna **PORTS** (deve ser algo como `0.0.0.0:55432->5432/tcp`).
- Se outro programa ja usar a mesma porta, altere `POSTGRES_PORT` no `.env`, recrie os containers (`docker compose down` e `docker compose up -d postgres redis`) e use a nova porta no Beekeeper.

## Fluxo recomendado para avaliacao

Para reduzir atrito em ambiente local, o fluxo mais seguro para demonstracao e este:

```bash
cd E:\postlike-queue
docker compose up -d postgres redis
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend npm run prisma:seed
docker compose up --build backend worker frontend
```

Esse fluxo evita depender da conexao local do host com o PostgreSQL para migration e seed, usando o proprio servico `backend` dentro da rede do Docker Compose.

### PowerShell no Windows

Em versoes antigas do PowerShell, `&&` entre comandos pode nao funcionar. Nesse caso, execute um comando por linha ou use `;` como separador, por exemplo:

```powershell
cd E:\postlike-queue
docker compose down -v
docker compose up -d postgres redis
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend npm run prisma:seed
docker compose up --build backend worker frontend
```

## Como funciona a fila

1. O frontend chama `POST /posts/:id/likes` com `userId`.
2. A API valida o payload e verifica se o post existe.
3. A API adiciona um job na fila BullMQ.
4. O worker consome o job.
5. O worker tenta inserir a curtida em `post_likes`.
6. Se a curtida for nova, incrementa `likes_count`.
7. Se a curtida ja existir, nao incrementa novamente.
8. Quando um novo like e persistido, o worker invalida as chaves de cache afetadas.

## Como funciona o cache

Cache implementado com Redis por meio de uma camada pequena:

- `get`
- `set` com TTL
- `del`

Chaves atuais:

- ranking: `posts:ranking:top-liked`
- detalhe do post: `posts:{postId}`

Fluxo do ranking:

1. `GET /posts/ranking/top-liked` tenta ler do Redis
2. em cache hit, retorna imediatamente
3. em cache miss, consulta o PostgreSQL, salva no Redis e devolve a resposta
4. quando um like novo e processado, o worker invalida a chave

## Como a consistencia dos likes foi garantida

O projeto se apoia em tres mecanismos simples e robustos:

1. `UNIQUE(post_id, user_id)` em `post_likes`
2. transacao no worker para inserir a curtida e incrementar o contador
3. incremento atomico com Prisma (`increment: 1`)

Consequencia pratica:

- dois likes simultaneos do mesmo usuario para o mesmo post nao geram dupla contagem
- likes de usuarios diferentes para o mesmo post sao acumulados corretamente
- o contador final continua consistente mesmo sob concorrencia

## Fluxos principais

### Fluxo 1: listar posts

1. frontend chama `GET /posts`
2. API consulta o PostgreSQL
3. resposta contem os posts com `likesCount`

### Fluxo 2: curtir um post

1. usuario informa `userId`
2. frontend chama `POST /posts/:id/likes`
3. se for a primeira curtida daquele usuario naquele post, a API retorna `202 Accepted` e enfileira o job; se ja existir curtida, retorna `409 Conflict`
4. worker processa a fila e persiste curtidas novas
5. frontend pode atualizar detalhes e ranking em seguida

### Fluxo 3: ranking

1. frontend chama `GET /posts/ranking/top-liked`
2. API tenta o Redis primeiro
3. se necessario, busca no PostgreSQL
4. resposta traz ranking ordenado por `likesCount desc`

## Endpoints documentados

Todos os endpoints estao documentados no Swagger:

- `GET /posts`
- `POST /posts`
- `GET /posts/:id`
- `POST /posts/:id/likes`
- `GET /posts/:id/likes`
- `GET /posts/ranking/top-liked`

## Seed inicial

O seed cria posts de exemplo para demonstracao.

Comportamento:

- se nao houver posts, ele insere os dados iniciais
- se ja houver posts, ele nao sobrescreve os dados existentes

## Pontos opcionais incluidos

- cache adicional em `GET /posts/:id`
- feedback visual no frontend para carregamento, sucesso e erro
- criacao de post pela interface (`POST /posts`) e textos da UI em portugues

## Observacoes finais

A solucao evita complexidade desnecessaria:

- sem microservicos
- sem NestJS
- sem autenticacao complexa
- sem CQRS
- sem eventos distribuidos

O foco e entregar uma implementacao pequena, profissional, robusta sob concorrencia e facil de defender tecnicamente.
