import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadToBlob } from "@/lib/blob";

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo no campo file." }, { status: 400 });
    }

    const blob = await uploadToBlob(file);
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha no upload." },
      { status: 400 }
    );
  }
}
