import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createPrismaPayload, lovePageInclude, lovePageSchema, toLovePageDraft } from "@/lib/love-page";
import { defaultLovePage } from "@/types/love-page";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const prisma = getPrisma();
  let page = await prisma.lovePage.findFirst({
    orderBy: { createdAt: "asc" },
    include: lovePageInclude
  });

  if (!page) {
    page = await prisma.lovePage.create({
      data: {
        slug: defaultLovePage.slug,
        title: defaultLovePage.title,
        mainPhrase: defaultLovePage.mainPhrase,
        specialMessage: defaultLovePage.specialMessage,
        finalMessage: defaultLovePage.finalMessage,
        theme: defaultLovePage.theme,
        primaryColor: defaultLovePage.primaryColor,
        secondaryColor: defaultLovePage.secondaryColor,
        timelineEnabled: defaultLovePage.timelineEnabled,
        timelineTitle: defaultLovePage.timelineTitle,
        timelineSubtitle: defaultLovePage.timelineSubtitle,
        timelineEndText: defaultLovePage.timelineEndText,
        wrappedSectionEnabled: defaultLovePage.wrappedSectionEnabled,
        wrappedTime: defaultLovePage.wrappedTime,
        wrappedTitle: defaultLovePage.wrappedTitle,
        wrappedSubtitle: defaultLovePage.wrappedSubtitle,
        wrappedAccentColor: defaultLovePage.wrappedAccentColor,
        mapSectionEnabled: defaultLovePage.mapSectionEnabled,
        mapTitle: defaultLovePage.mapTitle,
        mapSubtitle: defaultLovePage.mapSubtitle,
        starSectionEnabled: defaultLovePage.starSectionEnabled,
        starTitle: defaultLovePage.starTitle,
        starPhrase: defaultLovePage.starPhrase,
        starLocation: defaultLovePage.starLocation,
        starDateTime: null,
        starLatitude: defaultLovePage.starLatitude,
        starLongitude: defaultLovePage.starLongitude,
        counterText: { create: defaultLovePage.counterText },
        wordGame: { create: defaultLovePage.wordGame }
      },
      include: lovePageInclude
    });
  }

  return NextResponse.json({ page: toLovePageDraft(page) });
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const parsed = lovePageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const page = await getPrisma().lovePage.create({
      data: createPrismaPayload(parsed.data, "create"),
      include: lovePageInclude
    });
    return NextResponse.json({ page: toLovePageDraft(page) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível criar." },
      { status: 400 }
    );
  }
}
