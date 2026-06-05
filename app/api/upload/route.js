// app/api/upload/route.js — Upload de imagens via Vercel Blob
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Gerar nome único
    const ext  = file.name.split('.').pop() || 'jpg';
    const name = `amor-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const blob = await put(name, file, {
      access: 'public',
      contentType: file.type || 'image/jpeg',
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
