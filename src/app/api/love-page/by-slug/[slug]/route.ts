import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { lovePageInclude, toLovePageDraft } from "@/lib/love-page";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await getPrisma().lovePage.findUnique({
    where: { slug },
    include: lovePageInclude
  });

  if (!page || !page.isPublished) {
    return NextResponse.json({ error: "Página não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ page: toLovePageDraft(page) });
}
