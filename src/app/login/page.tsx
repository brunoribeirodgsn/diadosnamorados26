"use client";

import { Heart, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { RomanticButton } from "@/components/ui/RomanticButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Não foi possível entrar.");
      return;
    }
    window.location.assign("/admin/editor");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <GlassCard className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose/18 text-rose">
            <Heart className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-4xl font-semibold text-white">Entrar no admin</h1>
          <p className="mt-2 text-sm text-white/52">Use as credenciais definidas no .env.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-white/12 bg-white/[0.07] px-4 py-3 text-white outline-none focus:border-rose"
            placeholder="email"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-white/12 bg-white/[0.07] px-4 py-3 text-white outline-none focus:border-rose"
            placeholder="senha"
          />
          {error ? <div className="rounded-xl border border-red-300/20 bg-red-500/15 p-3 text-sm text-red-100">{error}</div> : null}
          <RomanticButton type="submit" className="w-full" disabled={loading}>
            <LockKeyhole className="h-4 w-4" />
            {loading ? "Entrando..." : "Entrar"}
          </RomanticButton>
        </form>
      </GlassCard>
    </main>
  );
}
