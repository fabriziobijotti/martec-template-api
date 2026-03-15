# Martec Template API - Vercel-first + PostgreSQL + TypeScript (Next.js 16.1.6)

Template oficial para criar APIs customizadas que se integram ao Martec.app (SaaS com Marketplace).

Objetivo: subir rapido na Vercel, ter banco local com Docker, migrations seguras e testes.

Baseline deste template:

- `next@16.1.6`
- `react@19.2.0`
- `react-dom@19.2.0`

Requisitos minimos de runtime:

- `node >= 20.11.0` (recomendado: Node 22)
- `npm >= 10`

## Guia rapido para Ubuntu + VS Code Terminal

Se aparecer `nvm: command not found` (como no seu log), siga os passos abaixo exatamente.

## Passo 0 - Pre requisitos

No Ubuntu, garanta que voce tem:

```bash
sudo apt update
sudo apt install -y curl git build-essential ca-certificates
```

## Passo 1 - Instalar NVM corretamente

1. Instale o NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

2. Feche e abra o terminal do VS Code.

3. Se ainda nao funcionar, carregue o shell manualmente:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

4. Valide:

```bash
nvm -v
```

Se esse comando mostrar uma versao, o NVM esta ok.

## Passo 2 - Instalar Node (recomendado: 22)

```bash
nvm install 22
nvm use 22
node -v
npm -v
```

Opcional para fixar default:

```bash
nvm alias default 22
```

## Passo 3 - Clonar o projeto e instalar dependencias

```bash
git clone https://github.com/SEU-USUARIO/seu-repo.git
cd seu-repo
npm ci
```

## Passo 4 - Configurar variaveis de ambiente

```bash
cp .env.example .env.development.local
```

Arquivo padrao local:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=local_user
POSTGRES_PASSWORD=local_password
POSTGRES_DB=martec_dev
DATABASE_URL=postgresql://local_user:local_password@localhost:5433/martec_dev
```

## Passo 5 - Subir PostgreSQL local com Docker

```bash
npm run services:up
```

Se quiser validar container:

```bash
docker ps
```

## Passo 6 - Rodar migrations

Ja existe migration de exemplo no template (`infra/migrations/0001_create_users_table.sql`).

Antes de aplicar, confirme que as dependencias foram instaladas:

```bash
npm ci
```

Aplicar:

```bash
npm run migration:up
```

Criar nova migration no futuro:

```bash
npm run migration:create nome_da_migration
```

## Passo 7 - Rodar API local

```bash
npm run dev
```

Teste os endpoints:

- `http://localhost:3000/api/v1/status`
- `http://localhost:3000/api/v1/migrations` (GET = pendentes, POST = aplica)

Exemplo de POST migrations:

```bash
curl -X POST http://localhost:3000/api/v1/migrations
```

## Passo 8 - Rodar testes de integracao

Antes dos testes, garanta que o Postgres local esta ativo e migrado:

```bash
npm run services:up
npm run migration:up
```

Observacao:

- Os testes de `migrations` usam mock do runner (`infra/migration-runner.ts`) para evitar erro ESM do `node-pg-migrate` no Jest.
- O teste de `status` continua sendo integracao real com Postgres.

```bash
npm test
```

Modo watch:

```bash
npm run test:watch
```

Nota sobre atalhos do watch:

- A tecla `o` (rodar testes relacionados a arquivos alterados) so funciona quando o projeto foi clonado com Git e existe pasta `.git`.
- Se aparecer `--watch is not supported without git/hg, please use --watchAll`, use `Enter` para rerodar, ou execute `npm run test:watch` (ja usa `--watchAll`).

## Passo 9 - Deploy na Vercel (zero config)

1. Crie conta em `vercel.com`.
2. Importe o repositorio.
3. Em Environment Variables, configure as mesmas variaveis do `.env.example`.
4. Em producao, prefira `DATABASE_URL` (Neon, Supabase, Vercel Postgres).
5. Faça deploy. Cada `git push` gera novo deploy.

## Solucao de problemas (Ubuntu)

`nvm: command not found`:

1. Rode os comandos de carregamento manual do Passo 1.
2. Confira se o seu shell e bash: `echo $SHELL`
3. Confira se `~/.bashrc` contem o bloco do NVM.
4. Rode `source ~/.bashrc` e teste `nvm -v`.

Node antigo (exemplo: `v18.19.1`) e projeto quebrando:

1. Rode `nvm use 22`.
2. Apague dependencias e reinstale:

```bash
rm -rf node_modules
npm ci
```

`npm ci` ou `npm install` falha com `ERESOLVE unable to resolve dependency tree` (Next x React):

1. O template usa `next@16.1.6`, com `react@19.2.0` e `react-dom@19.2.0`.
2. Garanta que seu `package.json` esteja exatamente com essas versoes.
3. Rode novamente:

```bash
npm ci
```

4. Nao use `--force` ou `--legacy-peer-deps` como solucao padrao.

`next build` falha com erro de versao do Node (exemplo: `Node.js version \">=20.9.0\" is required`):

1. Rode `nvm use 22`.
2. Valide:

```bash
node -v
npm -v
```

3. Execute novamente:

```bash
npm run build
```

Docker nao sobe:

1. Verifique Docker Desktop/Engine ativo.
2. Teste permissao:

```bash
docker ps
```

3. Se der permissao negada, adicione usuario ao grupo docker e reabra sessao:

```bash
sudo usermod -aG docker $USER
```

Aviso `Found orphan containers` ao rodar `npm run services:up`:

1. O script atual ja usa `--remove-orphans` e limpa automaticamente.
2. Se quiser limpar e recriar o banco local completamente:

```bash
npm run services:reset-db
```

`node-pg-migrate: not found` ao rodar `npm run migration:up`:

1. Isso indica que as dependencias nao foram instaladas nesse clone.
2. Rode:

```bash
npm ci
```

3. Execute novamente:

```bash
npm run migration:up
```

`The DATABASE_URL environment variable is not set or incomplete connection parameters are provided`:

1. No `.env.development.local`, configure `DATABASE_URL` com o mesmo banco local.
2. Exemplo:

```env
DATABASE_URL=postgresql://local_user:local_password@localhost:5433/martec_dev
```

3. Rode novamente:

```bash
npm run migration:up
```

`npm run migration:up` mostra o comando sem `--database-url-var DATABASE_URL`:

1. O `package.json` local esta desatualizado.
2. Atualize com:

```bash
git pull
npm ci
```

3. Rode novamente:

```bash
npm run migration:up
```

`Not run migration ... is preceding already run migration 0001_create_users_table`:

1. Isso acontece quando o nome da migration local foi alterado apos voce ja ter rodado migrations no banco local.
2. No template oficial, a migration base deve ser `infra/migrations/0001_create_users_table.sql`.
3. Se o banco local ja ficou inconsistente, recrie o banco local:

```bash
npm run services:reset-db
npm run migration:up
```

`Jest encountered an unexpected token` apontando para `node-pg-migrate/dist/bundle/index.js`:

1. Atualize codigo e dependencias:

```bash
git pull
npm ci
```

2. O template usa wrapper interno (`infra/migration-runner.ts`) e mock nos testes de migrations para evitar parsing ESM do `node-pg-migrate` no Jest.
3. Rode novamente:

```bash
npm test
```

4. Se ainda persistir, limpe cache do Jest:

```bash
npx jest --clearCache
```

## Integracao futura com Martec Core

- Quando liberar acesso, instalar pacotes privados `@martec/core-*` via GitHub Packages.
- Usar esses pacotes para tipos, contratos e validacoes sem expor o core privado.
- Criar novos endpoints em `pages/api/v1/`.

## Scripts uteis

- `npm run dev`
- `npm run services:up`
- `npm run services:down`
- `npm run services:reset-db`
- `npm run migration:create <nome>`
- `npm run migration:up`
- `npm run migration:up:prod`
- `npm test`

## Mapa do codigo

Arquivos principais para estudo:

- `infra/database.ts`: conexao com PostgreSQL (`getNewClient`) e helper de consulta (`query`).
- `infra/migration-runner.ts`: wrapper do `node-pg-migrate` para manter migrations desacopladas e testaveis.
- `pages/api/v1/status/index.ts`: endpoint de status da API e da conexao com banco.
- `pages/api/v1/migrations/index.ts`: endpoint para listar migrations pendentes (GET) e aplicar migrations (POST).
- `tests/integration/api/v1/status/get.test.ts`: teste de integracao real do endpoint `status`.
- `tests/integration/api/v1/migrations/get.test.ts`: teste do endpoint `migrations` via mocks.
- `tests/integration/api/v1/migrations/post.test.ts`: teste do endpoint `migrations` via mocks.
- `jest.config.ts`: configuracao de testes (ambiente, alias `@/`, convencao de arquivos).
- `next.config.mjs`: configuracao global do Next.js.

Padrao didatico usado no projeto:

- Comentarios curtos explicam o objetivo de cada bloco importante.
- Nomes de funcoes e variaveis descrevem intencao antes de implementacao.
- Testes validam contrato de resposta e comportamento esperado do endpoint.

## Estrutura

```text
martec-template-api/
├── infra/
│   ├── compose.yaml
│   ├── database.ts
│   └── migrations/
│       └── 0001_create_users_table.sql
├── pages/
│   └── api/
│       └── v1/
│           ├── status/
│           │   └── index.ts
│           └── migrations/
│               └── index.ts
├── tests/
│   └── integration/
│       └── api/
│           └── v1/
│               ├── status/
│               │   └── get.test.ts
│               └── migrations/
│                   ├── get.test.ts
│                   └── post.test.ts
├── .env.example
├── .editorconfig
├── .gitignore
├── .nvmrc
├── .prettierignore
├── .prettierrc
├── jest.config.ts
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```
# martec-template-api
