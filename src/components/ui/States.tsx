import { Heart, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <GlassCard className="flex items-center gap-3 text-white/70">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </GlassCard>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/16 bg-white/[0.04] p-6 text-center">
      <Heart className="mx-auto mb-3 h-7 w-7 text-rose" />
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/58">{text}</p>
    </div>
  );
}
