import Link from "next/link";
import { Heart, LayoutDashboard, WandSparkles } from "lucide-react";
import { RomanticButton } from "@/components/ui/RomanticButton";
import { LogoutButton } from "@/components/admin/LogoutButton";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-ink/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-3 group">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-rose/30 to-rose/10 border border-rose/25 transition-all duration-300 group-hover:border-rose/50 group-hover:shadow-glow-sm">
              <Heart className="h-4 w-4 text-rose animate-heartbeat" />
            </span>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Presente Digital</p>
              <p className="text-[10px] tracking-[0.1em] uppercase text-white/40 leading-tight">painel admin</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1.5">
            <Link href="/admin">
              <RomanticButton variant="ghost" className="px-3 h-9 text-xs">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </RomanticButton>
            </Link>
            <Link href="/admin/editor">
              <RomanticButton variant="secondary" className="px-3 h-9 text-xs">
                <WandSparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Editor</span>
              </RomanticButton>
            </Link>
            <div className="ml-1">
              <LogoutButton />
            </div>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
