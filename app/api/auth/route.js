// app/api/auth/route.js — Verificar senha do admin
import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const sql = getDb();
    const rows = await sql`SELECT admin_password FROM site_config WHERE id = 1`;
    const stored = rows[0]?.admin_password || process.env.ADMIN_PASSWORD || 'amor2024';
    const ok = password === stored;
    return NextResponse.json({ ok });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
