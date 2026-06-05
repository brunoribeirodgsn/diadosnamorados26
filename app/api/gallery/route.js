// app/api/gallery/route.js
import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM gallery_photos ORDER BY sort_order ASC, id ASC`;
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
        UPDATE gallery_photos SET
          src        = ${body.src ?? ''},
          caption    = ${body.caption ?? ''},
          sort_order = ${body.sort_order ?? 0}
        WHERE id = ${body.id}
      `;
      return NextResponse.json({ ok: true, id: body.id });
    } else {
      const result = await sql`
        INSERT INTO gallery_photos (src, caption, sort_order)
        VALUES (${body.src ?? ''}, ${body.caption ?? ''}, ${body.sort_order ?? 0})
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
    await sql`DELETE FROM gallery_photos WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
