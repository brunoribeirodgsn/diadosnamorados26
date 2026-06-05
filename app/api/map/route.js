// app/api/map/route.js
import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM map_locations ORDER BY sort_order ASC, id ASC`;
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const sql  = getDb();

    if (body.id) {
      await sql`
        UPDATE map_locations SET
          name          = ${body.name ?? ''},
          lat           = ${body.lat ?? 0},
          lng           = ${body.lng ?? 0},
          description   = ${body.description ?? ''},
          date_visit    = ${body.date_visit ?? ''},
          photo_url     = ${body.photo_url ?? ''},
          photo_caption = ${body.photo_caption ?? ''},
          nickname      = ${body.nickname ?? ''},
          sort_order    = ${body.sort_order ?? 0}
        WHERE id = ${body.id}
      `;
      return NextResponse.json({ ok: true, id: body.id });
    } else {
      const result = await sql`
        INSERT INTO map_locations (name, lat, lng, description, date_visit, photo_url, photo_caption, nickname, sort_order)
        VALUES (
          ${body.name ?? ''}, ${body.lat ?? 0}, ${body.lng ?? 0},
          ${body.description ?? ''}, ${body.date_visit ?? ''},
          ${body.photo_url ?? ''}, ${body.photo_caption ?? ''},
          ${body.nickname ?? ''},
          ${body.sort_order ?? 0}
        ) RETURNING id
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
    await sql`DELETE FROM map_locations WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
