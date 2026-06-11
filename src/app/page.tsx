import Link from "next/link";
import { ArrowRight, Heart, LockKeyhole, Smartphone, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-rose/10 blur-3xl" />
        <div className="absolute -right-24 top-32 h-72 w-72 rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-lilac/8 blur-3xl" />
      </div>

      <section className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-[1fr_440px]">
        {/* Left column */}
        <div className="space-y-8 animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/72 backdrop-blur-sm">
            <Heart className="h-4 w-4 text-rose animate-heartbeat" />
            Presente digital pessoal
          </div>

          {/* Headline */}
          <div className="space-y-5">
            <h1 className="max-w-4xl font-serif text-6xl font-bold leading-[0.95] text-white md:text-7xl">
              Uma página romântica para guardar a{" "}
              <span className="text-gradient-romantic">história</span> de vocês.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/60">
              Crie um presente privado com fotos, música, contador, linha do tempo, jogo da palavra, mapa afetivo e QR Code. Tudo configurável pelo painel admin.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/editor">
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose to-gold px-6 py-3 text-sm font-bold text-ink shadow-glow transition hover:brightness-110 hover:scale-[1.02]">
                <Sparkles className="h-4 w-4" />
                Ir para o editor
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/login">
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">
                <LockKeyhole className="h-4 w-4" />
                Acessar admin
              </button>
            </Link>
          </div>
        </div>

        {/* Right column — feature cards */}
        <div className="relative space-y-4" style={{ animationDelay: "0.2s" }}>
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-rose/6 blur-3xl" />

          {[
            {
              Icon: Smartphone,
              title: "Preview em tempo real",
              text: "Veja como fica no celular enquanto edita",
              color: "from-rose/20 to-rose/5",
              iconBg: "bg-rose/18 border-rose/22 text-rose"
            },
            {
              Icon: Sparkles,
              title: "Experiência emocional",
              text: "Seções animadas, música, mapas e muito mais",
              color: "from-gold/20 to-gold/5",
              iconBg: "bg-gold/16 border-gold/22 text-gold"
            },
            {
              Icon: LockKeyhole,
              title: "Admin privado e simples",
              text: "Você configura tudo, ela só recebe o link",
              color: "from-lilac/20 to-lilac/5",
              iconBg: "bg-lilac/16 border-lilac/22 text-lilac"
            }
          ].map(({ Icon, title, text, color, iconBg }, i) => (
            <div
              key={title}
              className={`glass group flex items-start gap-4 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-glass-lg`}
              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-white">{title}</p>
                <p className="mt-0.5 text-sm text-white/55">{text}</p>
              </div>
            </div>
          ))}

          {/* Decorative heart */}
          <div className="absolute -bottom-6 -right-6 text-5xl animate-float-slow pointer-events-none select-none opacity-30">
            🌹
          </div>
        </div>
      </section>
    </main>
  );
}
