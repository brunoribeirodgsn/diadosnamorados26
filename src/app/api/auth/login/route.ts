import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, setAdminCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "Configure ADMIN_EMAIL e ADMIN_PASSWORD no .env." },
      { status: 500 }
    );
  }

  if (parsed.data.email !== adminEmail || parsed.data.password !== adminPassword) {
    return NextResponse.json({ error: "Email ou senha incorretos." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, email: parsed.data.email });
  setAdminCookie(response, createSessionToken(parsed.data.email));
  return response;
}
