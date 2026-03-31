# Finance Hub — Frontend

Frontend do Finance Hub construído com Next.js 15, TypeScript e Tailwind CSS.

## Requisitos

- Node.js 20+
- npm 10+
- API do Finance Hub rodando (ver repositório da API)

## Setup

1. Clone o repositório
2. Instale as dependências:
```bash
   npm install
```
3. Copie o arquivo de variáveis de ambiente:
```bash
   cp .env.example .env.local
```
4. Edite o `.env.local` com a URL da sua API
5. Rode em desenvolvimento:
```bash
   npm run dev
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (porta 3000) |
| `npm run build` | Build de produção |
| `npm run start` | Inicia o servidor de produção (após build) |
| `npm run lint` | Verifica erros de lint |

## Estrutura