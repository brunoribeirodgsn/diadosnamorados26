import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteBlob } from "@/lib/blob";
import { getPrisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { id } = await params;
  const prisma = getPrisma();
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) {
    return NextResponse.json({ ok: true });
  }

  await prisma.photo.delete({ where: { id } });
  await deleteBlob(photo.url).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
