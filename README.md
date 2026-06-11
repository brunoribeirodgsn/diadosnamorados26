# Presente Digital Romantico

Sistema fullstack pessoal para criar uma pagina romantica de Dia dos Namorados, aniversario de namoro ou declaracao especial. Ele tem um painel admin privado com editor por etapas e preview mobile em tempo real.

Nao ha checkout, pagamento, planos, roleta ou multiusuario complexo.

## Stack

- Next.js 15 com App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- Neon PostgreSQL
- Vercel Blob
- Zustand
- Zod
- Framer Motion
- Dnd-kit
- QR Code
- Lucide React

## Rotas

- `/` landing simples
- `/login` login do administrador
- `/admin` dashboard
- `/admin/editor` editor com preview mobile
- `/p/[slug]` pagina publica publicada

## Instalar

```bash
npm install
```

Crie o arquivo `.env` a partir de `.env.example`:

```env
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=

ADMIN_EMAIL=
ADMIN_PASSWORD=

YOUTUBE_API_KEY=

SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Configurar Neon

1. Crie um projeto no Neon.
2. Copie a connection string PostgreSQL.
3. Cole em `DATABASE_URL`.
4. Rode:

```bash
npx prisma generate
npx prisma db push
```

## Configurar Vercel Blob

1. No projeto da Vercel, crie um Blob Store.
2. Copie o token de leitura/escrita.
3. Cole em `BLOB_READ_WRITE_TOKEN`.

Sem esse token o sistema abre, mas uploads reais retornam erro orientando a configurar a variavel.

## Rodar local

```bash
npm run dev
```

Acesse:

- Admin: `http://localhost:3000/login`
- Editor: `http://localhost:3000/admin/editor`

Use `ADMIN_EMAIL` e `ADMIN_PASSWORD` do `.env`.

## Publicar a pagina

1. Entre no admin.
2. Abra `/admin/editor`.
3. Preencha titulo, nomes, data, musica, fotos, mensagem, contador, timeline, palavra e mapa.
4. Clique em `Salvar` para rascunho ou `Publicar`.
5. Copie o link publico ou use o QR Code.

A rota `/p/[slug]` so aparece quando `isPublished` esta ativo.

## Deploy na Vercel

1. Envie o projeto para um repositorio.
2. Importe na Vercel.
3. Configure as variaveis de ambiente.
4. Garanta que o Blob Store esteja conectado.
5. Rode `npx prisma db push` apontando para o banco Neon.
6. Faça deploy.

## YouTube e Spotify reais

O endpoint `POST /api/music/search` busca no Spotify quando `SPOTIFY_CLIENT_ID` e `SPOTIFY_CLIENT_SECRET` estao configurados. Se o Spotify bloquear a chamada por exigir Premium no dono do app, o endpoint tenta o YouTube quando `YOUTUBE_API_KEY` existe. Sem chaves externas, ou se todas falharem, ele retorna sugestoes locais.

Para busca real, use:

- `YOUTUBE_API_KEY` para YouTube Data API
- `SPOTIFY_CLIENT_ID` e `SPOTIFY_CLIENT_SECRET` para Spotify Web API

O formato de resposta em `src/app/api/music/search/route.ts` continua sendo:

```ts
{
  title: string;
  artist: string;
  url: string;
  thumbnail: string;
  duration: string;
  provider: "youtube" | "spotify";
}
```

## Comandos

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run prisma:generate
npm run prisma:push
```
