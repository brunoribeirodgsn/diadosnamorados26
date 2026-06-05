// app/api/word-game/route.js
import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM word_game WHERE id = 1`;
    return NextResponse.json(rows[0] || { word: 'AMOR', hint: '', title: 'O que mais gosto em você' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const sql  = getDb();
    await sql`
      UPDATE word_game SET
        word  = ${(body.word ?? 'AMOR').toUpperCase()},
        hint  = ${body.hint ?? ''},
        title = ${body.title ?? 'O que mais gosto em você'}
      WHERE id = 1
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
