import { notFound } from "next/navigation";
import { LovePageRenderer } from "@/components/public/LovePageRenderer";
import { getPrisma } from "@/lib/prisma";
import { lovePageInclude, toLovePageDraft } from "@/lib/love-page";

export default async function PublicLovePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPrisma().lovePage.findUnique({
    where: { slug },
    include: lovePageInclude
  });

  if (!page || !page.isPublished) notFound();

  return <LovePageRenderer page={toLovePageDraft(page)} />;
}
