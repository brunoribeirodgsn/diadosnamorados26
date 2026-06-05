// app/api/timeline/route.js
import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM timeline_events ORDER BY sort_order ASC, id ASC
    `;
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const sql  = getDb();

    // Upsert: se tem id, atualiza; se não, insere
    if (body.id) {
      await sql`
        UPDATE timeline_events SET
          date_event    = ${body.date_event ?? ''},
          emoji         = ${body.emoji ?? '⭐'},
          title         = ${body.title ?? ''},
          description   = ${body.description ?? ''},
          photo_url     = ${body.photo_url ?? ''},
          photo_caption = ${body.photo_caption ?? ''},
          sort_order    = ${body.sort_order ?? 0}
        WHERE id = ${body.id}
      `;
      return NextResponse.json({ ok: true, id: body.id });
    } else {
      const result = await sql`
        INSERT INTO timeline_events
          (date_event, emoji, title, description, photo_url, photo_caption, sort_order)
        VALUES
          (${body.date_event ?? ''}, ${body.emoji ?? '⭐'},
           ${body.title ?? ''}, ${body.description ?? ''},
           ${body.photo_url ?? ''}, ${body.photo_caption ?? ''},
           ${body.sort_order ?? 0})
        RETURNING id
      `;
      return NextResponse.json({ ok: true, id: result[0].id });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const sql = getDb();
    await sql`DELETE FROM timeline_events WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
