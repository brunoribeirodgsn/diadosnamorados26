import Link from "next/link";
import { cookies } from "next/headers";
import { BarChart3, Eye, Heart, PencilLine, Rocket, Share2 } from "lucide-react";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { RomanticButton } from "@/components/ui/RomanticButton";
import { getPrisma } from "@/lib/prisma";
import { lovePageInclude, toLovePageDraft } from "@/lib/love-page";
import { verifySessionToken } from "@/lib/auth";
import { publicUrl } from "@/lib/utils";

export default async function AdminPage() {
  const store = await cookies();
  if (!verifySessionToken(store.get("love_admin_session")?.value)) redirect("/login");

  const page = await getPrisma().lovePage.findFirst({
    include: lovePageInclude,
    orderBy: { createdAt: "asc" }
  });
  const draft = page ? toLovePageDraft(page) : null;

  const stats = [
    {
      icon: Heart,
      iconClass: "bg-rose/16 border-rose/22 text-rose",
      label: "Página",
      value: draft?.title || "Ainda não criada",
      small: draft ? "Criada com amor ♥" : "Vá ao editor para criar"
    },
    {
      icon: BarChart3,
      iconClass: "bg-gold/16 border-gold/22 text-gold",
      label: "Visualizações",
      value: String(draft?.views ?? 0),
      small: draft?.views ? "vezes ela abriu ❤" : "Publique para receber visitas"
    },
    {
      icon: Eye,
      iconClass: "bg-lilac/16 border-lilac/22 text-lilac",
      label: "Status",
      value: draft?.isPublished ? "✓ Publicado" : "Rascunho",
      small: draft?.isPublished ? "Disponível para ela ver" : "Salve e publique quando estiver pronto"
    }
  ] as const;

  return (
    <AdminLayout>
      <main className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <p className="section-label">
            <span>♥</span> Dashboard
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-white md:text-5xl">
            Seu presente digital
          </h1>
          <p className="mt-2 text-sm text-white/48">Gerencie e monitore o presente de amor</p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map(({ icon: Icon, iconClass, label, value, small }) => (
            <GlassCard key={label} className="flex flex-col gap-4">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${iconClass}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">{label}</p>
                <h2 className="mt-1 text-2xl font-bold text-white leading-tight">{value}</h2>
                <p className="mt-1 text-xs text-white/38">{small}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
          <GlassCard className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`h-2 w-2 rounded-full ${draft?.isPublished ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" : "bg-white/25"}`} />
                <p className="text-xs text-white/45">{draft?.isPublished ? "Online agora" : "Não publicado"}</p>
              </div>
              <p className="font-bold text-white">Editor principal</p>
              <p className="mt-0.5 text-sm text-white/50">Ajuste textos, fotos, música, mapa e publicação</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {draft?.isPublished ? (
                <a href={publicUrl(draft.slug)} target="_blank">
                  <RomanticButton variant="secondary">
                    <Eye className="h-4 w-4" />
                    Abrir
                  </RomanticButton>
                </a>
              ) : null}
              <Link href="/admin/editor">
                <RomanticButton>
                  <PencilLine className="h-4 w-4" />
                  Editar presente
                </RomanticButton>
              </Link>
            </div>
          </GlassCard>

          {draft?.isPublished ? (
            <GlassCard variant="accent" className="flex flex-col items-center justify-center gap-3 min-w-[160px] text-center">
              <Rocket className="h-6 w-6 text-rose" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose">Ao vivo!</p>
                <p className="mt-0.5 text-xs text-white/50">Ela já pode acessar</p>
              </div>
              <a href={publicUrl(draft.slug)} target="_blank" className="block w-full">
                <RomanticButton className="w-full text-xs h-8 px-3">
                  <Share2 className="h-3 w-3" />
                  Ver página
                </RomanticButton>
              </a>
            </GlassCard>
          ) : null}
        </div>

        {/* Tips */}
        {!draft ? (
          <div className="mt-6 rounded-2xl border border-rose/20 bg-rose/8 p-5">
            <p className="font-semibold text-rose mb-1">✦ Começando agora?</p>
            <p className="text-sm text-white/60">
              Vá para o editor, preencha o título com os nomes de vocês e comece a montar o presente. Você salva como rascunho e só publica quando estiver perfeito.
            </p>
          </div>
        ) : null}
      </main>
    </AdminLayout>
  );
}
