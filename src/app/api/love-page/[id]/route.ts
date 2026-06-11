import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createPrismaPayload, lovePageInclude, lovePageSchema, toLovePageDraft } from "@/lib/love-page";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { id } = await params;
  const parsed = lovePageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const page = await getPrisma().lovePage.update({
      where: { id },
      data: createPrismaPayload(parsed.data),
      include: lovePageInclude
    });
    return NextResponse.json({ page: toLovePageDraft(page) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível salvar." },
      { status: 400 }
    );
  }
}
