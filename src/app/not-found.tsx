import Link from "next/link";
import { HeartCrack } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { RomanticButton } from "@/components/ui/RomanticButton";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <GlassCard className="max-w-md text-center">
        <HeartCrack className="mx-auto mb-4 h-10 w-10 text-rose" />
        <h1 className="font-serif text-4xl font-semibold text-white">Página não encontrada</h1>
        <p className="mt-3 text-sm leading-6 text-white/58">Ela pode ainda estar em rascunho ou o link pode ter mudado.</p>
        <Link href="/">
          <RomanticButton className="mt-6">Voltar</RomanticButton>
        </Link>
      </GlassCard>
    </main>
  );
}
