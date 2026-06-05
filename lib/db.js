// lib/db.js — Conexão com o Neon PostgreSQL
import { neon } from '@neondatabase/serverless';

// Cria uma nova conexão a cada request (serverless-friendly)
export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada. Veja .env.example');
  }
  return neon(process.env.DATABASE_URL);
}

// ════════════════════════════════════════════════════════════════
//  MIGRATE — Cria as tabelas se não existirem
// ════════════════════════════════════════════════════════════════
export async function migrate() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS site_config (
      id            INTEGER PRIMARY KEY DEFAULT 1,
      name1         TEXT    DEFAULT 'Ela',
      name2         TEXT    DEFAULT 'Ele',
      start_date    TEXT    DEFAULT '2022-06-12T00:00:00',
      entry_title   TEXT    DEFAULT 'Nossa História ✨',
      entry_subtitle TEXT   DEFAULT 'Um presente especial criado com amor',
      hero_tagline  TEXT    DEFAULT 'Juntos desde sempre, para sempre',
      counter_label TEXT    DEFAULT 'Juntos há',
      special_message TEXT  DEFAULT 'Escreva uma mensagem especial...',
      message_signature TEXT DEFAULT 'Com todo o meu amor 💖',
      music_url     TEXT    DEFAULT '',
      music_song    TEXT    DEFAULT 'Nossa Música',
      music_artist  TEXT    DEFAULT 'Artista',
      star_date     TEXT    DEFAULT '2022-06-12',
      star_lat      FLOAT   DEFAULT -23.5505,
      star_lng      FLOAT   DEFAULT -46.6333,
      star_title    TEXT    DEFAULT 'O céu no dia em que nos encontramos',
      admin_password TEXT   DEFAULT 'amor2024',
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Garantir que existe ao menos 1 linha de configuração
  await sql`
    INSERT INTO site_config (id) VALUES (1)
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS timeline_events (
      id            SERIAL PRIMARY KEY,
      date_event    TEXT,
      emoji         TEXT    DEFAULT '⭐',
      title         TEXT    NOT NULL DEFAULT '',
      description   TEXT    DEFAULT '',
      photo_url     TEXT    DEFAULT '',
      photo_caption TEXT    DEFAULT '',
      sort_order    INTEGER DEFAULT 0,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gallery_photos (
      id         SERIAL PRIMARY KEY,
      src        TEXT    NOT NULL DEFAULT '',
      caption    TEXT    DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS word_game (
      id    INTEGER PRIMARY KEY DEFAULT 1,
      word  TEXT DEFAULT 'AMOR',
      hint  TEXT DEFAULT 'O que sinto por você',
      title TEXT DEFAULT 'O que mais gosto em você'
    )
  `;

  await sql`
    INSERT INTO word_game (id) VALUES (1)
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS map_locations (
      id          SERIAL PRIMARY KEY,
      name        TEXT    NOT NULL DEFAULT '',
      lat         FLOAT   NOT NULL DEFAULT 0,
      lng         FLOAT   NOT NULL DEFAULT 0,
      description TEXT    DEFAULT '',
      date_visit  TEXT    DEFAULT '',
      sort_order  INTEGER DEFAULT 0,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}
