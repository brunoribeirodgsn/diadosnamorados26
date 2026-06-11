import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await getPrisma().lovePage.updateMany({
    where: { slug, isPublished: true },
    data: { views: { increment: 1 } }
  });

  return NextResponse.json({ ok: page.count > 0 });
}
