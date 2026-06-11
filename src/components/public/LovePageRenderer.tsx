"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MoreHorizontal,
  Music,
  Pause,
  Play,
  QrCode,
  Repeat2,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Star
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { LovePageDraft } from "@/types/love-page";
import { calculateTogetherTime, cn, isVideoUrl, normalizeWord, publicUrl } from "@/lib/utils";
import { EmptyState } from "@/components/ui/States";

const MapPolaroid = dynamic(() => import("@/components/public/MapPolaroid"), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-[#1a1f2e] animate-pulse" />
});

// ─── Utility helpers ────────────────────────────────────────────────

function parseDuration(value?: string | null) {
  if (!value) return 0;
  const parts = value.split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function formatTime(value: number) {
  const safeValue = Math.max(0, Math.floor(value));
  const minutes = Math.floor(safeValue / 60);
  const seconds = String(safeValue % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getDirectAudioUrl(url?: string | null) {
  if (!url) return "";
  return /\.(mp3|m4a|aac|wav|ogg|oga)(\?|$)/i.test(url) ? url : "";
}

function getYoutubeVideoId(url?: string | null) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.replace("/", "");
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop() || "";
    }
  } catch {
    return "";
  }
  return "";
}

function formatDisplayDate(value?: string | null, fallback = "") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(date)
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatShortDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(date);
}

function formatStarDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dateText = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  const timeText = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(date);
  return `${dateText.toUpperCase()} - ${timeText}`;
}

function formatCoordinate(value?: number | null, positive = "N", negative = "S") {
  if (typeof value !== "number") return "";
  return `${Math.abs(value).toFixed(4)}°${value < 0 ? negative : positive}`;
}

function seededPoint(seed: string, min: number, max: number) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(index)) >>> 0;
  }
  // Extra mixing for better distribution
  hash ^= hash >>> 16;
  hash = (Math.imul(hash, 0x45d9f3b)) >>> 0;
  hash ^= hash >>> 16;
  return min + (hash % (max - min + 1));
}

// ─── Floating hearts decoration ────────────────────────────────────

function FloatingHearts({ count = 8, color = "#f45b8a" }: { count?: number; color?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute text-xl opacity-0"
          style={{
            left: `${10 + (i * 11) % 80}%`,
            top: `${15 + (i * 17) % 70}%`,
            animation: `float-slow ${4 + (i % 3)}s ease-in-out ${i * 0.5}s infinite`,
            opacity: 0.12 + (i % 4) * 0.05,
            fontSize: `${14 + (i % 3) * 6}px`,
            color
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

// ─── Animated section entrance ──────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`
      }}
    >
      {children}
    </div>
  );
}

// ─── Animated counter number ────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span
      ref={ref}
      style={{
        display: "inline-block",
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.5s ease, transform 0.5s ease"
      }}
    >
      {value}
    </span>
  );
}

// ─── YouTube audio bridge ───────────────────────────────────────────

function YoutubeAudioBridge({ videoId, playing }: { videoId: string; playing: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!videoId || !origin) return;
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: playing ? "playVideo" : "pauseVideo", args: [] }),
      "https://www.youtube.com"
    );
  }, [origin, playing, videoId]);

  if (!videoId || !origin) return null;

  return (
    <iframe
      ref={iframeRef}
      title="Player do YouTube"
      src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1&loop=1&playlist=${videoId}&origin=${encodeURIComponent(origin)}`}
      allow="autoplay; encrypted-media"
      onLoad={() => {
        if (!playing) return;
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "https://www.youtube.com"
        );
      }}
      className="pointer-events-none absolute h-px w-px opacity-0"
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}

// ─── Music Player ───────────────────────────────────────────────────

function RomanticMusicPlayer({ page }: { page: LovePageDraft }) {
  const music = page.music;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const directAudioUrl = getDirectAudioUrl(music?.url);
  const youtubeVideoId = getYoutubeVideoId(music?.url);
  const displayedDuration = audioDuration || parseDuration(music?.duration);
  const progress = displayedDuration ? Math.min(100, (currentTime / displayedDuration) * 100) : playing ? 18 : 0;
  const artwork = music?.thumbnail || page.coverImageUrl || page.photos.find((photo) => photo.isCover)?.url || page.photos[0]?.url;
  const hasPlayableSource = Boolean(directAudioUrl || youtubeVideoId);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setAudioDuration(parseDuration(music?.duration));
  }, [music?.duration, music?.url]);

  useEffect(() => {
    if (!playing || directAudioUrl) return;
    const interval = window.setInterval(() => {
      setCurrentTime((value) => {
        if (!displayedDuration) return value + 1;
        return value >= displayedDuration ? 0 : value + 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [directAudioUrl, displayedDuration, playing]);

  if (!music?.title) return null;

  async function togglePlayback() {
    if (directAudioUrl && audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
        return;
      }
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
      return;
    }
    if (youtubeVideoId) {
      setPlaying((value) => !value);
      return;
    }
    if (music?.url) {
      window.open(music.url, "_blank", "noopener,noreferrer");
    }
  }

  function seek(value: number) {
    if (!displayedDuration) return;
    const nextTime = (value / 100) * displayedDuration;
    setCurrentTime(nextTime);
    if (audioRef.current) audioRef.current.currentTime = nextTime;
  }

  return (
    <section className="relative overflow-hidden bg-[#16436f] px-4 pb-8 pt-3 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.08),transparent_34%),radial-gradient(circle_at_20%_0%,rgba(255,255,255,.14),transparent_18rem)]" />
      <div className="relative z-10 mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between text-white/92">
          <button className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10" aria-label="Voltar">
            <ChevronDown className="h-5 w-5" />
          </button>
          <p className="truncate px-3 text-center text-xs font-bold">Para o meu grande amor</p>
          <button className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10" aria-label="Mais opções">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <motion.div
          className="overflow-hidden rounded-lg bg-white/10 shadow-[0_18px_45px_rgba(0,0,0,.28)]"
          animate={playing ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {artwork ? (
            isVideoUrl(artwork) ? (
              <video src={artwork} autoPlay muted loop playsInline className="aspect-square w-full object-cover" />
            ) : (
              <img src={artwork} alt="" className="aspect-square w-full object-cover" />
            )
          ) : (
            <div className="flex aspect-square w-full items-center justify-center bg-white/12">
              <Music className="h-16 w-16 text-white/72" />
            </div>
          )}
        </motion.div>

        <div className="mt-5 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-black leading-tight">{music.title}</h2>
            <p className="mt-1 truncate text-sm text-white/68">{music.artist || music.provider || "Nossa música"}</p>
          </div>
          <CheckCircle2 className="mt-1 h-8 w-8 shrink-0 fill-white text-[#16436f]" />
        </div>

        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(event) => seek(Number(event.target.value))}
            className="h-1 w-full accent-white"
            aria-label="Progresso da música"
          />
          <div className="mt-1 flex justify-between text-[11px] text-white/72">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(Math.max(0, displayedDuration - currentTime))}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10" aria-label="Aleatório">
            <Shuffle className="h-5 w-5" />
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full text-white/58 transition hover:bg-white/10" aria-label="Faixa anterior">
            <SkipBack className="h-6 w-6 fill-current" />
          </button>
          <motion.button
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#16436f] shadow-lg"
            whileTap={{ scale: 0.92 }}
            onClick={togglePlayback}
            aria-label={playing ? "Pausar música" : "Tocar música"}
          >
            {playing ? <Pause className="h-8 w-8 fill-current" /> : <Play className="ml-1 h-8 w-8 fill-current" />}
          </motion.button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10" aria-label="Próxima faixa">
            <SkipForward className="h-6 w-6 fill-current" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10" aria-label="Repetir">
            <Repeat2 className="h-5 w-5" />
          </button>
        </div>

        {!hasPlayableSource ? (
          <p className="mt-4 text-center text-xs text-white/58">Toque para abrir a música em uma nova aba.</p>
        ) : null}
      </div>

      {directAudioUrl ? (
        <audio
          ref={audioRef}
          src={directAudioUrl}
          loop
          onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration || parseDuration(music.duration))}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onEnded={(event) => {
            event.currentTarget.currentTime = 0;
            event.currentTarget.play().catch(() => setPlaying(false));
          }}
        />
      ) : null}
      <YoutubeAudioBridge videoId={youtubeVideoId} playing={playing} />
    </section>
  );
}

// ─── Counter stat ───────────────────────────────────────────────────

function Stat({ value, label }: { value: number; label?: string | null }) {
  return (
    <FadeUp>
      <div className="rounded-2xl border border-white/12 bg-white/[0.07] p-3 text-center transition-all duration-200 hover:bg-white/[0.10]">
        <div className="text-2xl font-bold text-white">
          <AnimatedNumber value={value} />
        </div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-white/50">{label}</div>
      </div>
    </FadeUp>
  );
}

// ─── Wrapped / Moments Intro ─────────────────────────────────────────

function MomentsIntro({ page }: { page: LovePageDraft }) {
  if (!page.wrappedSectionEnabled) return null;

  const names = page.wrappedTitle || [page.senderName, page.receiverName].filter(Boolean).join(" e ") || page.title;
  const subtitle = page.wrappedSubtitle || "Os momentos que marcaram essa relação";
  const accent = page.wrappedAccentColor || "#1ed760";
  const darkAccent = "#063d18";

  return (
    <section
      className="relative min-h-[86vh] overflow-hidden bg-black px-5 py-8 text-white"
      style={{ "--wrapped": accent, "--wrapped-dark": darkAccent } as React.CSSProperties}
    >
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={`left-${index}`}
            className="green-pillar absolute top-0 w-9 bg-gradient-to-b from-[var(--wrapped)] to-[var(--wrapped-dark)] opacity-85"
            style={{ height: `${48 + index * 12}%`, left: `${index * 9}%`, animationDelay: `${index * 0.16}s` }}
          />
        ))}
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={`right-${index}`}
            className="green-pillar absolute top-0 w-9 bg-gradient-to-b from-[var(--wrapped)] to-[var(--wrapped-dark)] opacity-85"
            style={{ height: `${48 + index * 12}%`, right: `${index * 9}%`, animationDelay: `${0.35 + index * 0.16}s` }}
          />
        ))}
        <span className="green-pillar absolute bottom-0 left-1/2 h-[72%] w-28 -translate-x-1/2 bg-gradient-to-b from-[var(--wrapped)] to-[var(--wrapped-dark)] opacity-70 blur-[1px]" />
        <span className="green-pillar absolute bottom-0 left-[34%] h-[62%] w-16 -translate-x-1/2 bg-gradient-to-b from-[var(--wrapped)] to-[var(--wrapped-dark)] opacity-55" />
        <span className="green-pillar absolute bottom-0 left-[66%] h-[62%] w-16 -translate-x-1/2 bg-gradient-to-b from-[var(--wrapped)] to-[var(--wrapped-dark)] opacity-55" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-sm flex-col items-center justify-center text-center pb-16 pt-12">
        <motion.h2
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[300px] text-6xl font-black leading-[0.92] text-[var(--wrapped)] drop-shadow-[0_0_28px_rgba(30,215,96,.5)]"
        >
          {names}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 max-w-[320px] whitespace-pre-line text-3xl font-black leading-[1.22] text-white"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}

// ─── Story Gallery ───────────────────────────────────────────────────

function StoryGallery({ page }: { page: LovePageDraft }) {
  const [active, setActive] = useState(0);

  // Clamp active index when photos are removed
  useEffect(() => {
    if (page.photos.length > 0 && active >= page.photos.length) {
      setActive(page.photos.length - 1);
    }
  }, [active, page.photos.length]);

  useEffect(() => {
    if (page.photos.length < 2) return;
    const interval = window.setInterval(() => {
      setActive((index) => (index + 1) % page.photos.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, [page.photos.length]);

  if (!page.photos.length) {
    return <EmptyState title="Sem fotos ainda" text="Adicione lembranças no editor para preencher a galeria." />;
  }

  const current = page.photos[Math.min(active, page.photos.length - 1)];

  function previous() {
    setActive((index) => (index - 1 + page.photos.length) % page.photos.length);
  }

  function next() {
    setActive((index) => (index + 1) % page.photos.length);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {page.photos.map((photo, index) => (
          <button
            key={photo.id}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/16"
            onClick={() => setActive(index)}
            aria-label={`Foto ${index + 1}`}
          >
            <span
              className={cn(
                "block h-full rounded-full transition-all duration-700",
                index === active ? "w-full bg-[var(--primary)]" : "w-0 bg-white/40"
              )}
            />
          </button>
        ))}
      </div>
      <figure className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.06] shadow-glass">
        <motion.div
          key={current.url}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {isVideoUrl(current.url) ? (
            <video src={current.url} controls className="aspect-[9/14] w-full object-cover" />
          ) : (
            <img src={current.url} alt="" className="aspect-[9/14] w-full object-cover" />
          )}
        </motion.div>
        <button
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/60"
          onClick={previous}
          aria-label="Foto anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/60"
          onClick={next}
          aria-label="Próxima foto"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        {current.caption ? (
          <motion.figcaption
            key={current.caption}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5 text-sm leading-6 text-white"
          >
            {current.caption}
          </motion.figcaption>
        ) : null}
      </figure>
      <p className="text-center text-xs text-white/38">
        {active + 1} / {page.photos.length}
      </p>
    </div>
  );
}

// ─── Timeline ───────────────────────────────────────────────────────

function RomanticTimeline({ page }: { page: LovePageDraft }) {
  if (!page.timelineEnabled) return null;

  return (
    <section className="relative overflow-hidden bg-[#111113] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle,rgba(255,255,255,.5)_1px,transparent_1.5px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute -left-8 top-24 h-20 w-20 rounded-full bg-[#f4efff] opacity-60 blur-xl" />
      <div className="pointer-events-none absolute -right-9 top-56 h-20 w-20 rounded-full bg-[#f4efff] opacity-50 blur-xl" />
      <div className="relative z-10 mx-auto max-w-[360px]">
        <FadeUp className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#ff5aa7]">Timeline</p>
          <h2 className="mt-2 font-serif text-2xl font-bold">{page.timelineTitle}</h2>
          <p className="mt-2 text-xs text-white/58">{page.timelineSubtitle}</p>
        </FadeUp>

        {page.timelineItems.length ? (
          <div className="relative mt-8 pb-4">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/18" />
            {page.timelineItems.map((item, index) => {
              const imageFirst = index % 2 === 0;
              return (
                <FadeUp key={item.id} delay={index * 0.1}>
                  <div className="relative grid min-h-[170px] grid-cols-[1fr_28px_1fr] items-center gap-1 py-3">
                    <div className={cn("flex", imageFirst ? "justify-start" : "justify-end text-right")}>
                      {imageFirst ? <TimelinePolaroid item={item} /> : <TimelineText item={item} />}
                    </div>
                    <div className="relative z-10 flex justify-center">
                      <motion.span
                        whileInView={{ scale: [0.5, 1.2, 1] }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff5aa7] shadow-[0_0_0_7px_rgba(255,90,167,.14)]"
                      >
                        <Heart className="h-3.5 w-3.5 fill-white text-white" />
                      </motion.span>
                    </div>
                    <div className={cn("flex", imageFirst ? "justify-end text-left" : "justify-start")}>
                      {imageFirst ? <TimelineText item={item} /> : <TimelinePolaroid item={item} />}
                    </div>
                  </div>
                </FadeUp>
              );
            })}
            {page.timelineEndText ? (
              <FadeUp className="mt-6">
                <p className="text-center font-serif text-xl text-[#ff5aa7]">✦ {page.timelineEndText} ✦</p>
              </FadeUp>
            ) : null}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState title="Linha do tempo vazia" text="Os momentos aparecem aqui quando forem adicionados." />
          </div>
        )}
      </div>
    </section>
  );
}

function TimelineText({ item }: { item: LovePageDraft["timelineItems"][number] }) {
  return (
    <div className="max-w-[126px]">
      <h3 className="text-sm font-black text-[#ff5aa7]">{formatDisplayDate(item.date, item.title || "Momento")}</h3>
      <p className="mt-1 text-xs leading-5 text-white/72">{item.description || item.title}</p>
    </div>
  );
}

function TimelinePolaroid({ item }: { item: LovePageDraft["timelineItems"][number] }) {
  return (
    <figure className="w-[112px] rotate-[-3deg] rounded-sm bg-white p-2 pb-7 text-center text-ink shadow-xl transition-transform duration-300 hover:rotate-0 hover:scale-105">
      {item.imageUrl ? (
        isVideoUrl(item.imageUrl) ? (
          <video src={item.imageUrl} muted playsInline className="aspect-[4/5] w-full object-cover" />
        ) : (
          <img src={item.imageUrl} alt="" className="aspect-[4/5] w-full object-cover" />
        )
      ) : (
        <div className="flex aspect-[4/5] w-full items-center justify-center bg-[#ded9e8] text-[#9b6cff]">
          <Star className="h-7 w-7" />
        </div>
      )}
      <figcaption className="mt-2 line-clamp-2 font-serif text-[10px] leading-3">
        {item.photoCaption || item.title || "Nosso momento"}
      </figcaption>
    </figure>
  );
}

// ─── Journey Map ─────────────────────────────────────────────────────

function JourneyMap({ page }: { page: LovePageDraft }) {
  const [active, setActive] = useState(0);
  const locations = page.mapLocations;
  const activeLocation = locations[active] || locations[0];

  useEffect(() => {
    if (active >= locations.length) setActive(0);
  }, [active, locations.length]);

  const lastLocationsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const isSubsequentUpdate = Object.keys(lastLocationsRef.current).length > 0;
    let changedIndex = -1;

    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const prevStr = lastLocationsRef.current[loc.id];
      const currentStr = JSON.stringify({
        lat: loc.lat,
        lng: loc.lng,
        imageUrl: loc.imageUrl,
        placeName: loc.placeName,
        placeNickname: loc.placeNickname,
        polaroidText: loc.polaroidText,
        date: loc.date,
        message: loc.message
      });

      if (isSubsequentUpdate) {
        if (!prevStr || prevStr !== currentStr) {
          changedIndex = i;
          break;
        }
      }
    }

    if (changedIndex !== -1) {
      setActive(changedIndex);
    }

    // Update reference
    const nextLocations: Record<string, string> = {};
    locations.forEach((loc) => {
      nextLocations[loc.id] = JSON.stringify({
        lat: loc.lat,
        lng: loc.lng,
        imageUrl: loc.imageUrl,
        placeName: loc.placeName,
        placeNickname: loc.placeNickname,
        polaroidText: loc.polaroidText,
        date: loc.date,
        message: loc.message
      });
    });
    lastLocationsRef.current = nextLocations;
  }, [locations]);

  if (!locations.length) {
    return <EmptyState title="Mapa esperando lugares" text="Adicione os lugares especiais da história." />;
  }

  function previous() {
    setActive((index) => (index - 1 + locations.length) % locations.length);
  }

  function next() {
    setActive((index) => (index + 1) % locations.length);
  }

  const hasCoords = activeLocation?.lat && activeLocation?.lng;
  const accentColor = page.primaryColor || "#f45b8a";

  return (
    <section className="overflow-hidden bg-[#0d0f14] text-white">
      {/* Header */}
      <FadeUp>
        <div className="px-5 pb-4 pt-10 text-center">
          <h2 className="font-serif text-3xl font-bold">{page.mapTitle || "Nossa Jornada no Mapa"}</h2>
          <p className="mt-1.5 text-sm text-white/48">{page.mapSubtitle || "Lugares que marcaram nossa história"}</p>
        </div>
      </FadeUp>

      {/* Location dots navigation */}
      {locations.length > 1 ? (
        <div className="flex justify-center gap-2 px-5 pb-3">
          {locations.map((loc, index) => (
            <button
              key={loc.id}
              onClick={() => setActive(index)}
              aria-label={loc.placeNickname || loc.placeName || `Lugar ${index + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === active ? "w-6" : "w-2 bg-white/25 hover:bg-white/45"
              )}
              style={index === active ? { background: accentColor } : undefined}
            />
          ))}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeLocation?.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Leaflet map with polaroid anchored at the exact marker position */}
          <div className="relative">
            {hasCoords ? (
              <div className="relative overflow-hidden">
                <MapPolaroid
                  lat={Number(activeLocation.lat)}
                  lng={Number(activeLocation.lng)}
                  imageUrl={activeLocation.imageUrl}
                  polaroidText={activeLocation.polaroidText}
                  date={activeLocation.date}
                  accentColor={accentColor}
                />
                {/* Gradient overlay at bottom for card blend */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0d0f14] to-transparent" />
              </div>
            ) : (
              /* No coords — just show the photo */
              activeLocation.imageUrl ? (
                <div className="mx-5 mb-4 overflow-hidden rounded-3xl border border-white/10">
                  {isVideoUrl(activeLocation.imageUrl) ? (
                    <video src={activeLocation.imageUrl} muted playsInline controls className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <img src={activeLocation.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
                  )}
                </div>
              ) : null
            )}
          </div>

          {/* Info card */}
          <div className="mx-5 mt-3 rounded-3xl border border-white/10 bg-[#161a22] p-5">
            <div className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-white"
                style={{ background: `${accentColor}22`, borderColor: `${accentColor}44`, color: accentColor }}
              >
                <MapPin className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-black leading-tight">
                  {activeLocation.placeNickname || activeLocation.placeName || "Lugar especial"}
                </h3>
                {activeLocation.placeNickname && activeLocation.placeName ? (
                  <p className="mt-0.5 text-xs text-white/45">{activeLocation.placeName}</p>
                ) : null}
                {activeLocation.date ? (
                  <p className="mt-1 text-xs font-semibold" style={{ color: page.secondaryColor || "#f3c677" }}>
                    {formatShortDate(activeLocation.date)}
                  </p>
                ) : null}
              </div>
            </div>
            {activeLocation.message ? (
              <p className="mt-4 text-sm leading-7 text-white/72">&ldquo;{activeLocation.message}&rdquo;</p>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {locations.length > 1 ? (
        <div className="flex gap-3 px-5 py-5">
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10"
            onClick={previous}
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-ink transition hover:brightness-110"
            style={{ background: `linear-gradient(135deg, var(--primary), var(--secondary))` }}
            onClick={next}
          >
            Próximo <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="pb-8" />
      )}
    </section>
  );
}

// ─── Star Map ────────────────────────────────────────────────────────

function StarMap({ page }: { page: LovePageDraft }) {
  if (!page.starSectionEnabled) return null;

  const names = page.starTitle || [page.senderName, page.receiverName].filter(Boolean).join(" e ") || page.title;
  const phrase = page.starPhrase || "O céu quando nossos mundos se colidiram";
  const location = page.starLocation || page.mapLocations[0]?.placeName || "Nosso lugar especial";
  const dateText = formatStarDateTime(page.starDateTime || page.specialDate);
  const coordinateText = [
    formatCoordinate(page.starLatitude ?? page.mapLocations[0]?.lat, "N", "S"),
    formatCoordinate(page.starLongitude ?? page.mapLocations[0]?.lng, "E", "W")
  ].filter(Boolean).join(" ");
  const seed = `${page.slug}-${names}-${phrase}-${location}`;
  const stars = Array.from({ length: 150 }).map((_, index) => ({
    id: index,
    x: seededPoint(`${seed}-star-x-${index}`, 3, 96),
    y: seededPoint(`${seed}-star-y-${index}`, 4, 95),
    size: seededPoint(`${seed}-star-size-${index}`, 1, 3),
    opacity: seededPoint(`${seed}-star-opacity-${index}`, 32, 100) / 100
  }));
  const constellationA = [{ x: 20, y: 37 }, { x: 30, y: 43 }, { x: 40, y: 38 }, { x: 50, y: 49 }, { x: 64, y: 54 }, { x: 77, y: 47 }];
  const constellationB = [{ x: 16, y: 66 }, { x: 26, y: 72 }, { x: 21, y: 83 }, { x: 31, y: 78 }];
  const constellationC = [{ x: 55, y: 76 }, { x: 55, y: 89 }, { x: 51, y: 84 }];

  return (
    <section className="relative overflow-hidden bg-[#020509] px-5 py-10 text-white">
      <div className="mx-auto max-w-[380px]">
        <FadeUp className="mb-8 text-center">
          <h2 className="font-serif text-5xl font-bold italic leading-none">{names}</h2>
        </FadeUp>

        <div className="relative mx-auto mt-10 aspect-square max-w-[340px] rounded-full border border-white/10 bg-[#030812]">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-[14%] rounded-full border border-white/9" />
          <div className="absolute inset-[28%] rounded-full border border-white/9" />
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/8" />
          <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/8" />
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={index}
              className="absolute left-1/2 top-1/2 h-px w-1/2 origin-left bg-white/7"
              style={{ transform: `rotate(${index * 15}deg)` }}
            />
          ))}
          {stars.map((star) => (
            <span
              key={star.id}
              className="star-twinkle absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: `${(star.id % 11) * 0.18}s`
              }}
            />
          ))}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
            {[constellationA, constellationB, constellationC].map((points, index) => (
              <polyline
                key={index}
                points={points.map((point) => `${point.x},${point.y}`).join(" ")}
                fill="none"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.9"
                className="constellation-line"
              />
            ))}
            {[...constellationA, ...constellationB, ...constellationC].map((point, index) => (
              <circle key={index} cx={point.x} cy={point.y} r={index % 5 === 0 ? "1.8" : "1.25"} fill="white" />
            ))}
          </svg>
        </div>

        <FadeUp className="mt-10 text-center" delay={0.2}>
          <p className="text-3xl font-black leading-[1.35] tracking-[0.18em]">&ldquo;{phrase} 💥 🤍&rdquo;</p>
          <div className="mt-8 space-y-3 text-sm uppercase tracking-[0.22em] text-white/58">
            <p>{location}</p>
            {dateText ? <p>{dateText}</p> : null}
            {coordinateText ? <p>{coordinateText}</p> : null}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Word Game ───────────────────────────────────────────────────────

function WordGame({ page }: { page: LovePageDraft }) {
  const target = normalizeWord(page.wordGame.secretWord || "");
  const [guess, setGuess] = useState("");
  const [won, setWon] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string }[]>([]);
  const keyboardRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row) => row.split(""));

  if (!page.wordGame.enabled || target.length < 3) return null;

  function submit(next = guess) {
    if (normalizeWord(next) === target) {
      setWon(true);
      // Spawn confetti
      const pieces = Array.from({ length: 18 }).map((_, i) => ({
        id: Date.now() + i,
        x: 20 + Math.random() * 60,
        color: ["#f45b8a", "#f3c677", "#b989f5", "#34d399"][i % 4]
      }));
      setConfetti(pieces);
      setTimeout(() => setConfetti([]), 1200);
    }
  }

  function addLetter(letter: string) {
    const next = (guess + letter).slice(0, target.length);
    setGuess(next);
    if (next.length === target.length) submit(next);
  }

  function removeLetter() {
    setGuess((value) => value.slice(0, -1));
  }

  return (
    <section className="relative overflow-hidden bg-[#0b0c0f] px-5 py-8 text-white">
      <div className="pointer-events-none absolute -left-8 top-36 h-20 w-20 rounded-full bg-[#f4efff] opacity-40 blur-2xl" />
      <div className="pointer-events-none absolute -right-9 top-36 h-20 w-20 rounded-full bg-[#f4efff] opacity-30 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 bottom-24 h-20 w-20 rounded-full bg-[#a277f5] opacity-35 blur-2xl" />

      {/* Confetti */}
      {confetti.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.x}%`,
            top: "30%",
            width: "8px",
            height: "8px",
            borderRadius: "2px",
            background: piece.color
          }}
        />
      ))}


      <FadeUp className="text-center">
        <h2 className="text-3xl font-black leading-tight">{page.wordGame.hint ? "Descubra a palavra secreta" : "O que mais gosto em você"}</h2>
        {page.wordGame.hint ? (
          <p className="mt-2 text-sm text-[var(--primary)] font-semibold">💡 Dica: {page.wordGame.hint}</p>
        ) : null}
        <p className="mt-3 text-xs text-white/54">({target.length} letras)</p>
      </FadeUp>

      <div
        className="mx-auto mt-7 grid max-w-[260px] gap-1.5"
        style={{ gridTemplateColumns: `repeat(${target.length}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: target.length * 6 }).map((_, index) => {
          const col = index % target.length;
          const row = Math.floor(index / target.length);
          const current = row === 0 ? (won ? target[col] : guess[col]) : "";
          return (
            <motion.div
              key={index}
              animate={current && row === 0 ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "flex aspect-square items-center justify-center rounded-[4px] border text-lg font-black",
                won && row === 0 ? "border-emerald-300 bg-emerald-400/25 text-emerald-50" : "border-white/18 bg-[#111316] text-white"
              )}
            >
              {current || ""}
            </motion.div>
          );
        })}
      </div>

      {won ? (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mx-auto mt-5 max-w-[280px] rounded-xl border border-emerald-300/25 bg-emerald-400/15 p-4 text-center text-sm text-emerald-50"
        >
          🎉 {page.wordGame.successMessage}
        </motion.div>
      ) : null}

      <div className="mx-auto mt-7 max-w-[330px] space-y-1.5">
        {keyboardRows.map((row, rowIndex) => (
          <div key={row.join("")} className={cn("grid gap-1.5", rowIndex === 0 ? "grid-cols-10" : rowIndex === 1 ? "grid-cols-9 px-3" : "grid-cols-9 px-9")}>
            {rowIndex === 2 ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="rounded bg-[#767b82] py-2.5 text-[10px] font-black text-white"
                onClick={removeLetter}
                aria-label="Apagar"
              >
                DEL
              </motion.button>
            ) : null}
            {row.map((letter) => (
              <motion.button
                key={letter}
                whileTap={{ scale: 0.85, y: 2 }}
                className="rounded bg-[#767b82] py-2.5 text-[10px] font-black text-white shadow-[inset_0_-2px_0_rgba(0,0,0,.16)]"
                onClick={() => addLetter(letter)}
              >
                {letter}
              </motion.button>
            ))}
            {rowIndex === 2 ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="rounded bg-[#767b82] py-2.5 text-[10px] font-black text-white"
                onClick={() => submit()}
                aria-label="Enviar"
              >
                OK
              </motion.button>
            ) : null}
          </div>
        ))}
      </div>

      <label className="sr-only" htmlFor="word-guess">Tentativa</label>
      <input
        id="word-guess"
        value={guess}
        maxLength={target.length}
        onChange={(event) => setGuess(normalizeWord(event.target.value).slice(0, target.length))}
        onKeyDown={(event) => { if (event.key === "Enter") submit(); }}
        className="sr-only"
      />
    </section>
  );
}

// ─── Main Renderer ───────────────────────────────────────────────────

export function LovePageRenderer({
  page,
  preview = false
}: {
  page: LovePageDraft;
  preview?: boolean;
}) {
  const [time, setTime] = useState(calculateTogetherTime(page.relationshipStartDate));
  const url = publicUrl(page.slug);
  const names = [page.senderName, page.receiverName].filter(Boolean).join(" & ");
  const cover = page.coverImageUrl || page.photos.find((photo) => photo.isCover)?.url || page.photos[0]?.url;
  const counter = page.counterText;
  const primaryColor = page.primaryColor || "#f45b8a";
  const secondaryColor = page.secondaryColor || "#f3c677";

  const visibleStats = useMemo(() => {
    if (!time) return [];
    return [
      counter.showYears && { value: time.years, label: counter.yearsLabel },
      counter.showMonths && { value: time.months, label: counter.monthsLabel },
      counter.showDays && { value: time.days, label: counter.daysLabel },
      counter.showHours && { value: time.hours, label: counter.hoursLabel },
      counter.showMinutes && { value: time.minutes, label: counter.minutesLabel },
      counter.showSeconds && { value: time.seconds, label: counter.secondsLabel }
    ].filter(Boolean) as { value: number; label?: string | null }[];
  }, [counter, time]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(calculateTogetherTime(page.relationshipStartDate));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [page.relationshipStartDate]);

  useEffect(() => {
    if (!preview && page.slug) {
      fetch(`/api/view/${page.slug}`, { method: "POST" }).catch(() => undefined);
    }
  }, [page.slug, preview]);

  return (
    <main
      className={cn("min-h-screen overflow-hidden text-white", preview ? "rounded-[2rem]" : "")}
      style={{
        "--primary": primaryColor,
        "--secondary": secondaryColor,
        background:
          `radial-gradient(circle at 20% 8%, ${primaryColor}33, transparent 28rem), ` +
          `radial-gradient(circle at 82% 14%, ${secondaryColor}2b, transparent 26rem), #100b12`
      } as React.CSSProperties}
    >
      <RomanticMusicPlayer page={page} />

      {/* ── Hero ── */}
      <section className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden px-5 pb-12 pt-20">
        <FloatingHearts count={6} color={primaryColor} />

        {cover ? (
          isVideoUrl(cover) ? (
            <video src={cover} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-55" />
          ) : (
            <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          )
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(244,91,138,.45),transparent_34rem),linear-gradient(160deg,#24101f,#110812)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />

        <div className="relative z-10 space-y-5">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/78 backdrop-blur animate-pulse-glow">
              <Heart className="h-3.5 w-3.5 text-[var(--primary)] animate-heartbeat" />
              Presente digital especial
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-5xl font-bold leading-[0.98]"
          >
            {page.title}
          </motion.h1>

          {/* Names */}
          {names ? (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/82"
            >
              {names}
            </motion.p>
          ) : null}

          {/* Main phrase */}
          {page.mainPhrase ? (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-xl text-base leading-7 text-white/72"
            >
              {page.mainPhrase}
            </motion.p>
          ) : null}

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <a href="#comecar">
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-ink shadow-glow transition hover:brightness-110 hover:scale-[1.03]"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                <Sparkles className="h-4 w-4" />
                Começar
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Counter ── */}
      <section id="comecar" className="space-y-6 px-5 py-10">
        <FadeUp>
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
            <p className="section-label">
              <span>✦</span> {counter.sinceText || "Juntos desde"}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold">{counter.title}</h2>
            <p className="mt-2 text-sm text-white/58">{counter.subtitle}</p>
            {time ? (
              <div className="mt-5 grid grid-cols-3 gap-2">
                {visibleStats.map((item) => (
                  <Stat key={item.label} value={item.value} label={item.label} />
                ))}
              </div>
            ) : (
              <EmptyState title="Escolha uma data" text="O contador aparece assim que a data de início for preenchida." />
            )}
          </div>
        </FadeUp>
      </section>

      <MomentsIntro page={page} />

      {/* ── Gallery ── */}
      <section className="space-y-5 px-5 py-10">
        <FadeUp>
          <div>
            <p className="section-label">
              <span>📷</span> Galeria
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Nossas lembranças</h2>
          </div>
        </FadeUp>
        <FadeUp delay={0.1}>
          <StoryGallery page={page} />
        </FadeUp>
      </section>

      {/* ── Special Message ── */}
      {page.specialMessage ? (
        <section className="px-5 py-12">
          <FadeUp>
            <div
              className="relative rounded-3xl border border-white/12 p-6 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${primaryColor}2b, ${secondaryColor}18)` }}
            >
              {/* Decorative quote marks */}
              <span
                className="pointer-events-none absolute -left-2 -top-4 font-serif text-[120px] font-black leading-none opacity-10 select-none"
                style={{ color: primaryColor }}
              >
                &ldquo;
              </span>
              <p className="relative z-10 font-serif text-xl leading-9 text-white">
                {page.specialMessage}
              </p>
              <span
                className="pointer-events-none absolute -bottom-10 -right-2 font-serif text-[120px] font-black leading-none opacity-10 select-none"
                style={{ color: secondaryColor }}
              >
                &rdquo;
              </span>
            </div>
          </FadeUp>
        </section>
      ) : null}

      <RomanticTimeline page={page} />

      <WordGame page={page} />

      {page.mapSectionEnabled ? <JourneyMap page={page} /> : null}

      <StarMap page={page} />

      {/* ── Final Section ── */}
      <section className="relative space-y-6 px-5 py-14 phone-safe overflow-hidden">
        <FloatingHearts count={10} color={primaryColor} />
        <FadeUp>
          {page.finalMessage ? (
            <p className="font-serif text-3xl font-bold leading-tight text-white">
              {page.finalMessage}
            </p>
          ) : null}
        </FadeUp>
      </section>

      {/* Footer */}
      <footer className="w-full pb-10 pt-4 text-center text-xs text-white/30 font-sans tracking-wider">
        feito com 🤍 por Bruno Ribeiro
      </footer>
    </main>
  );
}
