"use client";

import { cn } from "@/lib/utils";
import {
  Gamepad2,
  GitBranch,
  Images,
  Map,
  Music2,
  Rocket,
  Sparkles,
  Star,
  Timer,
  Type,
  Heart
} from "lucide-react";

export const editorSteps = [
  { label: "Título", icon: Type, hint: "Nome, nomes, cores e capa" },
  { label: "Música", icon: Music2, hint: "Nossa música especial" },
  { label: "Fotos", icon: Images, hint: "Galeria de memórias" },
  { label: "Mensagem", icon: Heart, hint: "Palavras do coração" },
  { label: "Contador", icon: Timer, hint: "Tempo juntos" },
  { label: "Wrapped", icon: Sparkles, hint: "Estilo Spotify Wrapped" },
  { label: "Timeline", icon: GitBranch, hint: "Linha do tempo mágica" },
  { label: "Palavra", icon: Gamepad2, hint: "Jogo da palavra secreta" },
  { label: "Mapa", icon: Map, hint: "Nossa jornada no mapa" },
  { label: "Estrelas", icon: Star, hint: "Mapa das estrelas" },
  { label: "Publicar", icon: Rocket, hint: "Finalizar e publicar" }
] as const;

export function EditorStepNavigation({
  active,
  onChange,
  filledSteps = []
}: {
  active: number;
  onChange: (step: number) => void;
  filledSteps?: number[];
}) {
  return (
    <div className="space-y-1">
      {editorSteps.map((step, index) => {
        const Icon = step.icon;
        const isActive = active === index;
        const isFilled = filledSteps.includes(index);

        return (
          <button
            key={step.label}
            className={cn("admin-sidebar-item group", isActive && "active")}
            onClick={() => onChange(index)}
          >
            {/* Icon */}
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                isActive
                  ? "bg-rose/20 text-rose"
                  : "bg-white/6 text-white/45 group-hover:bg-white/10 group-hover:text-white/70"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>

            {/* Label + hint */}
            <div className="min-w-0 flex-1">
              <span className={cn("block truncate text-[13px] font-semibold", isActive ? "text-white" : "text-white/60 group-hover:text-white/85")}>
                {step.label}
              </span>
            </div>

            {/* Step number */}
            <span className={cn("shrink-0 text-[10px] font-bold tabular-nums", isActive ? "text-rose/70" : "text-white/22")}>
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Filled dot */}
            <span className={cn("dot", isFilled && "filled")} />
          </button>
        );
      })}
    </div>
  );
}

/* Compact version for mobile / top bar */
export function EditorStepNavigationCompact({
  active,
  onChange
}: {
  active: number;
  onChange: (step: number) => void;
}) {
  return (
    <div className="flex overflow-x-auto gap-1.5 pb-1 soft-scrollbar">
      {editorSteps.map((step, index) => {
        const Icon = step.icon;
        const isActive = active === index;

        return (
          <button
            key={step.label}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200",
              isActive
                ? "border-rose/50 bg-rose/14 text-white"
                : "border-white/10 bg-white/[0.04] text-white/52 hover:bg-white/[0.08] hover:text-white/80"
            )}
            onClick={() => onChange(index)}
          >
            <Icon className={cn("h-3 w-3 shrink-0", isActive ? "text-rose" : "text-white/40")} />
            {step.label}
          </button>
        );
      })}
    </div>
  );
}
