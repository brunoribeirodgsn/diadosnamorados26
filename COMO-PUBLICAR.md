# 🚀 Como Publicar seu Site de Amor (Next.js + Neon DB)

Este projeto foi atualizado para uma arquitetura moderna e profissional utilizando **Next.js** no frontend/backend e **Neon PostgreSQL** como banco de dados. Agora, todas as alterações que você fizer no painel admin (/admin) serão salvas diretamente no banco de dados e refletidas imediatamente no site!

Abaixo estão os passos detalhados para rodar localmente e fazer o deploy na Vercel de graça.

---

## 🛠️ Passo 1: Configurar o Banco de Dados (Neon)

O Neon é um banco de dados PostgreSQL serverless super rápido e com plano gratuito excelente.

1. Acesse **[neon.tech](https://neon.tech/)** e crie uma conta gratuita.
2. Crie um novo projeto (ex: `site-de-amor`).
3. No painel principal do Neon, copie a **Connection String** (começa com `postgresql://...`).
4. Guarde essa URL! Ela é a sua `DATABASE_URL`.

---

## 💻 Passo 2: Rodar Localmente (Opcional)

Se você quiser testar no seu computador antes de publicar:

1. Na pasta raiz do projeto, crie um arquivo chamado **`.env.local`**.
2. Abra o arquivo e adicione a variável com a URL do Neon que você copiou:
   ```env
   DATABASE_URL="sua_connection_string_aqui"
   ADMIN_PASSWORD="sua_senha_aqui"
   ```
3. Abra o terminal na pasta do projeto e instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse [localhost:3000](http://localhost:3000) no seu navegador. O banco de dados será migrado automaticamente na primeira execução!

---

## 🚀 Passo 3: Publicar na Vercel (Deploy Gratuito)

Como o projeto é em Next.js, a melhor forma de hospedar é na Vercel.

### Opção A: Pelo GitHub (Recomendado)
1. Suba este projeto para um repositório privado ou público no seu **GitHub**.
2. Acesse **[vercel.com](https://vercel.com/)** e conecte sua conta do GitHub.
3. Clique em **"Add New"** > **"Project"** e selecione o repositório do site.
4. Na tela de configuração de Deploy, abra a seção **"Environment Variables"** e adicione:
   * **Nome**: `DATABASE_URL`
   * **Valor**: `sua_connection_string_do_neon_aqui`
5. *(Opcional)* Adicione também:
   * **Nome**: `ADMIN_PASSWORD`
   * **Valor**: `sua_senha_desejada` (caso queira alterar a senha padrão `amor2024`)
6. Clique em **"Deploy"** e aguarde a finalização!

### Opção B: Pelo Vercel CLI (Direto do Terminal)
Se tiver a Vercel CLI instalada, você pode publicar rodando na pasta do projeto:
```bash
npx vercel
```
Siga as instruções na tela e depois configure a variável de ambiente `DATABASE_URL` no painel do seu projeto na Vercel.

---

## 📸 Passo 4: Ativar o Upload de Fotos (Vercel Blob)

Para que o botão de "Upload" de fotos no seu painel admin funcione e salve as fotos direto na nuvem:

1. Acesse o painel do seu projeto no site da **Vercel**.
2. Vá na aba **"Storage"** no topo.
3. Escolha a opção **"Blob"** (armazenamento de arquivos) e clique em **"Create New"**.
4. Aceite os termos e conecte ao seu projeto.
5. Pronto! A Vercel criará automaticamente a variável `BLOB_READ_WRITE_TOKEN` nas configurações do seu projeto, e o upload de fotos no admin funcionará imediatamente no site publicado.

---

## 🔐 Como Acessar e Usar o Painel Admin

1. Acesse o link do seu site publicado e adicione `/admin` no final da URL (ex: `https://meu-site.vercel.app/admin`).
2. Digite a senha de acesso (padrão: `amor2024`).
3. Altere o que desejar nas abas:
   * **Casal**: Nome do casal, data de início e frases.
   * **Música**: Adicione o link de um MP3 de fundo (como os salvos no Vercel Blob).
   * **Mensagem**: Carta secreta dentro do envelope.
   * **Timeline**: Linha do tempo interativa com fotos.
   * **Galeria**: Adicione e gerencie fotos da galeria.
   * **Jogo**: Configure a palavra secreta para o jogo da forca.
   * **Mapa**: Adicione pins de coordenadas no mapa mundi.
   * **Estrelas**: Data e coordenadas para gerar o mapa das constelações.
4. Clique no botão **"Salvar"** no canto superior direito para gravar tudo diretamente no banco de dados!
