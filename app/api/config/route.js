// app/api/config/route.js
import { getDb, migrate } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await migrate();
    const sql = getDb();
    const rows = await sql`SELECT * FROM site_config WHERE id = 1`;
    return NextResponse.json(rows[0] || {});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const sql  = getDb();

    await sql`
      UPDATE site_config SET
        name1             = ${body.name1 ?? 'Ela'},
        name2             = ${body.name2 ?? 'Ele'},
        start_date        = ${body.start_date ?? '2022-06-12T00:00:00'},
        entry_title       = ${body.entry_title ?? 'Nossa História ✨'},
        entry_subtitle    = ${body.entry_subtitle ?? ''},
        hero_tagline      = ${body.hero_tagline ?? ''},
        counter_label     = ${body.counter_label ?? 'Juntos há'},
        special_message   = ${body.special_message ?? ''},
        message_signature = ${body.message_signature ?? ''},
        music_url         = ${body.music_url ?? ''},
        music_song        = ${body.music_song ?? ''},
        music_artist      = ${body.music_artist ?? ''},
        star_date         = ${body.star_date ?? ''},
        star_lat          = ${body.star_lat ?? -23.5505},
        star_lng          = ${body.star_lng ?? -46.6333},
        star_title        = ${body.star_title ?? ''},
        admin_password    = ${body.admin_password ?? 'amor2024'},
        updated_at        = NOW()
      WHERE id = 1
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
