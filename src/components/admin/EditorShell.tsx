"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Copy, Eye, Heart, Plus, Save, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PhonePreview } from "@/components/preview/PhonePreview";
import { GlassCard } from "@/components/ui/GlassCard";
import { RomanticButton } from "@/components/ui/RomanticButton";
import { LoadingState } from "@/components/ui/States";
import { CityAutocomplete } from "@/components/admin/CityAutocomplete";
import { Field, TextArea, TextInput, Toggle } from "@/components/admin/EditorFields";
import { editorSteps, EditorStepNavigation, EditorStepNavigationCompact } from "@/components/admin/EditorStepNavigation";
import { MusicSearch } from "@/components/admin/MusicSearch";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { QRCodeCard } from "@/components/admin/QRCodeCard";
import { SortableList } from "@/components/admin/SortableList";
import { useLovePageEditor } from "@/hooks/useLovePageEditor";
import { isVideoUrl, normalizeWord, publicUrl } from "@/lib/utils";
import type { CounterTextDraft, MapLocationDraft, MusicResult, PhotoItem, TimelineItemDraft } from "@/types/love-page";

const romanticMockMessage =
  "Desde que você chegou, tudo ficou mais bonito. Cada detalhe, cada sorriso e cada momento ao seu lado virou uma lembrança que eu quero guardar para sempre.";

const counterRows: {
  labelKey: keyof Pick<
    CounterTextDraft,
    "yearsLabel" | "monthsLabel" | "daysLabel" | "hoursLabel" | "minutesLabel" | "secondsLabel"
  >;
  showKey: keyof Pick<
    CounterTextDraft,
    "showYears" | "showMonths" | "showDays" | "showHours" | "showMinutes" | "showSeconds"
  >;
  label: string;
}[] = [
  { labelKey: "yearsLabel", showKey: "showYears", label: "Anos" },
  { labelKey: "monthsLabel", showKey: "showMonths", label: "Meses" },
  { labelKey: "daysLabel", showKey: "showDays", label: "Dias" },
  { labelKey: "hoursLabel", showKey: "showHours", label: "Horas" },
  { labelKey: "minutesLabel", showKey: "showMinutes", label: "Minutos" },
  { labelKey: "secondsLabel", showKey: "showSeconds", label: "Segundos" }
];

function uid() {
  return crypto.randomUUID();
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-white/8">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="mt-1 text-sm text-white/48">{description}</p>
    </div>
  );
}

export function EditorShell() {
  const [step, setStep] = useState(0);
  const [expandedMessage, setExpandedMessage] = useState(false);
  const { page, loading, saving, dirty, error, load, save, updatePage } = useLovePageEditor();
  const url = publicUrl(page.slug);

  // Compute which steps have meaningful data (for the filled dots)
  // Must be before any conditional returns to satisfy Rules of Hooks
  const filledSteps = useMemo(() => {
    if (loading) return [];
    const filled: number[] = [];
    if (page.title) filled.push(0);
    if (page.music?.title) filled.push(1);
    if (page.photos.length > 0) filled.push(2);
    if (page.specialMessage || page.finalMessage) filled.push(3);
    if (page.relationshipStartDate) filled.push(4);
    if (page.wrappedSectionEnabled) filled.push(5);
    if (page.timelineEnabled && page.timelineItems.length > 0) filled.push(6);
    if (page.wordGame.enabled && page.wordGame.secretWord) filled.push(7);
    if (page.mapSectionEnabled && page.mapLocations.length > 0) filled.push(8);
    if (page.starSectionEnabled) filled.push(9);
    if (page.isPublished) filled.push(10);
    return filled;
  }, [loading, page]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <LoadingState label="Carregando editor..." />
      </main>
    );
  }

  function updateCounter(patch: Partial<typeof page.counterText>) {
    updatePage({ counterText: { ...page.counterText, ...patch } });
  }

  function updateWordGame(patch: Partial<typeof page.wordGame>) {
    updatePage({
      wordGame: {
        ...page.wordGame,
        ...patch,
        secretWord:
          patch.secretWord !== undefined
            ? normalizeWord(patch.secretWord || "").slice(0, 10)
            : page.wordGame.secretWord
      }
    });
  }

  function updateMusic(patch: Partial<MusicResult>) {
    if (!page.music) return;
    updatePage({ music: { ...page.music, ...patch } });
  }

  function addPhoto(url: string) {
    if (page.photos.length >= 30) return;
    const next: PhotoItem = {
      id: uid(),
      url,
      caption: "",
      order: page.photos.length,
      isCover: page.photos.length === 0
    };
    updatePage({ photos: [...page.photos, next] });
  }

  function addPhotos(urls: string[]) {
    const availableSlots = Math.max(30 - page.photos.length, 0);
    if (!availableSlots) return;

    const nextPhotos = urls.slice(0, availableSlots).map((url, index): PhotoItem => ({
      id: uid(),
      url,
      caption: "",
      order: page.photos.length + index,
      isCover: page.photos.length === 0 && index === 0
    }));

    updatePage({ photos: [...page.photos, ...nextPhotos] });
  }

  function updatePhoto(id: string, patch: Partial<PhotoItem>) {
    updatePage({
      photos: page.photos.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo))
    });
  }

  function setCover(id: string) {
    const photo = page.photos.find((item) => item.id === id);
    updatePage({
      coverImageUrl: photo?.url || page.coverImageUrl,
      photos: page.photos.map((item) => ({ ...item, isCover: item.id === id }))
    });
  }

  function addTimelineItem() {
    updatePage({
      timelineItems: [
        ...page.timelineItems,
        {
          id: uid(),
          imageUrl: "",
          date: "",
          title: "Novo momento",
          description: "",
          photoCaption: "",
          order: page.timelineItems.length
        }
      ]
    });
  }

  function updateTimelineItem(id: string, patch: Partial<TimelineItemDraft>) {
    updatePage({
      timelineItems: page.timelineItems.map((item) => (item.id === id ? { ...item, ...patch } : item))
    });
  }

  function addMapLocation() {
    updatePage({
      mapLocations: [
        ...page.mapLocations,
        {
          id: uid(),
          imageUrl: "",
          placeName: "",
          placeNickname: "",
          date: "",
          message: "",
          polaroidText: "",
          lat: null,
          lng: null,
          order: page.mapLocations.length
        }
      ]
    });
  }

  function updateMapLocation(id: string, patch: Partial<MapLocationDraft>) {
    updatePage({
      mapLocations: page.mapLocations.map((item) => (item.id === id ? { ...item, ...patch } : item))
    });
  }

  const currentStep = editorSteps[step];

  const sections = [
    // 0 — Título
    <div key="title" className="space-y-5">
      <SectionHeader title="Informações Gerais" description="Configure o título, nomes, data e aparência visual." />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título do presente">
          <TextInput value={page.title} onChange={(event) => updatePage({ title: event.target.value })} placeholder="Nosso Amor" />
        </Field>
        <Field label="Link personalizado" hint={url}>
          <TextInput value={page.slug} onChange={(event) => updatePage({ slug: event.target.value })} placeholder="nosso-amor" />
        </Field>
        <Field label="Seu nome">
          <TextInput value={page.senderName || ""} onChange={(event) => updatePage({ senderName: event.target.value })} placeholder="Bruno" />
        </Field>
        <Field label="Nome de quem recebe">
          <TextInput value={page.receiverName || ""} onChange={(event) => updatePage({ receiverName: event.target.value })} placeholder="Nathallie" />
        </Field>
        <Field label="Início do relacionamento">
          <TextInput type="date" value={page.relationshipStartDate || ""} onChange={(event) => updatePage({ relationshipStartDate: event.target.value })} />
        </Field>
        <Field label="Data especial">
          <TextInput type="date" value={page.specialDate || ""} onChange={(event) => updatePage({ specialDate: event.target.value })} />
        </Field>
      </div>
      <Field label="Frase principal">
        <TextArea value={page.mainPhrase || ""} onChange={(event) => updatePage({ mainPhrase: event.target.value })} placeholder="Uma frase que define tudo..." />
      </Field>
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Tema Visual</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Cor principal">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={page.primaryColor || "#f45b8a"}
                onChange={(event) => updatePage({ primaryColor: event.target.value })}
                className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-white/12 bg-transparent"
              />
              <TextInput value={page.primaryColor || "#f45b8a"} onChange={(event) => updatePage({ primaryColor: event.target.value })} placeholder="#f45b8a" />
            </div>
          </Field>
          <Field label="Cor secundária">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={page.secondaryColor || "#f3c677"}
                onChange={(event) => updatePage({ secondaryColor: event.target.value })}
                className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-white/12 bg-transparent"
              />
              <TextInput value={page.secondaryColor || "#f3c677"} onChange={(event) => updatePage({ secondaryColor: event.target.value })} placeholder="#f3c677" />
            </div>
          </Field>
        </div>
        <div
          className="h-10 w-full rounded-xl transition-all"
          style={{ background: `linear-gradient(135deg, ${page.primaryColor || "#f45b8a"}, ${page.secondaryColor || "#f3c677"})` }}
        />
      </div>
      <Field label="Imagem de capa">
        <div className="space-y-3">
          <PhotoUploader label="Enviar capa" onUploaded={(coverImageUrl) => updatePage({ coverImageUrl })} />
          {page.coverImageUrl ? (
            isVideoUrl(page.coverImageUrl) ? (
              <video src={page.coverImageUrl} controls className="aspect-video w-full rounded-2xl object-cover" />
            ) : (
              <img src={page.coverImageUrl} alt="" className="aspect-video w-full rounded-2xl object-cover" />
            )
          ) : null}
        </div>
      </Field>
    </div>,

    // 1 — Música
    <div key="music" className="space-y-5">
      <SectionHeader title="Nossa Música" description="Escolha a trilha sonora do presente." />
      <MusicSearch onSelect={(music) => updatePage({ music })} />
      {page.music?.title ? (
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-4">
            {page.music.thumbnail ? <img src={page.music.thumbnail} alt="" className="h-16 w-16 rounded-2xl object-cover shadow-glass" /> : null}
            <div className="min-w-0">
              <p className="truncate font-bold text-white">{page.music.title}</p>
              <p className="truncate text-sm text-white/55">{page.music.artist || page.music.provider || "Nossa música"}</p>
            </div>
          </div>
          <Field label="Foto da capa da música" hint="Esta imagem substitui a capa original no player.">
            <PhotoUploader label="Enviar foto da capa" onUploaded={(thumbnail) => updateMusic({ thumbnail })} />
          </Field>
        </GlassCard>
      ) : null}
    </div>,

    // 2 — Fotos
    <div key="photos" className="space-y-5">
      <SectionHeader title="Galeria de Memórias" description="Adicione até 30 fotos e vídeos especiais." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-rose" />
          <p className="text-sm text-white/58">
            <span className="font-bold text-white">{page.photos.length}</span>/30 fotos adicionadas
          </p>
        </div>
        <PhotoUploader
          multiple
          maxFiles={30 - page.photos.length}
          onUploaded={addPhoto}
          onUploadedMany={addPhotos}
        />
      </div>
      <SortableList
        items={page.photos}
        onChange={(photos) => updatePage({ photos })}
        render={(photo) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 pl-10">
            <div className="grid gap-3 md:grid-cols-[120px_1fr]">
              {isVideoUrl(photo.url) ? (
                <video src={photo.url} controls className="aspect-square rounded-xl object-cover" />
              ) : (
                <img src={photo.url} alt="" className="aspect-square rounded-xl object-cover" />
              )}
              <div className="space-y-3">
                <TextInput value={photo.caption || ""} placeholder="Legenda da foto" onChange={(event) => updatePhoto(photo.id, { caption: event.target.value })} />
                <div className="flex flex-wrap gap-2">
                  <RomanticButton variant={photo.isCover ? "primary" : "secondary"} onClick={() => setCover(photo.id)}>
                    {photo.isCover ? "✓ Capa atual" : "Definir capa"}
                  </RomanticButton>
                  <RomanticButton
                    variant="danger"
                    onClick={() => updatePage({ photos: page.photos.filter((item) => item.id !== photo.id) })}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </RomanticButton>
                </div>
              </div>
            </div>
          </div>
        )}
      />
    </div>,

    // 3 — Mensagem
    <div key="message" className="space-y-5">
      <SectionHeader title="Mensagem do Coração" description="Escreva uma carta de amor para ela." />
      <Field label="Mensagem principal">
        <TextArea
          className={expandedMessage ? "min-h-[380px]" : ""}
          value={page.specialMessage || ""}
          onChange={(event) => updatePage({ specialMessage: event.target.value })}
          placeholder="Escreva do coração..."
        />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/40">
        <span>{(page.specialMessage || "").length} caracteres</span>
        <div className="flex gap-2">
          <RomanticButton variant="secondary" onClick={() => setExpandedMessage((value) => !value)}>
            {expandedMessage ? "Recolher" : "Expandir"}
          </RomanticButton>
          <RomanticButton variant="secondary" onClick={() => updatePage({ specialMessage: romanticMockMessage })}>
            ✨ Sugestão
          </RomanticButton>
        </div>
      </div>
      <Field label="Mensagem final" hint="Aparece na última seção da página, antes do QR Code.">
        <TextArea value={page.finalMessage || ""} onChange={(event) => updatePage({ finalMessage: event.target.value })} placeholder="Te amo mais que tudo..." />
      </Field>
    </div>,

    // 4 — Contador
    <div key="counter" className="space-y-5">
      <SectionHeader title="Contador de Tempo" description="Configure o display do tempo juntos." />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título">
          <TextInput value={page.counterText.title || ""} onChange={(event) => updateCounter({ title: event.target.value })} placeholder="Juntos há..." />
        </Field>
        <Field label="Subtítulo">
          <TextInput value={page.counterText.subtitle || ""} onChange={(event) => updateCounter({ subtitle: event.target.value })} />
        </Field>
        <Field label="Texto 'desde'">
          <TextInput value={page.counterText.sinceText || ""} onChange={(event) => updateCounter({ sinceText: event.target.value })} placeholder="Desde" />
        </Field>
        <Field label="Título dos números">
          <TextInput value={page.counterText.messageTitle || ""} onChange={(event) => updateCounter({ messageTitle: event.target.value })} />
        </Field>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {counterRows.map(({ labelKey, showKey, label }) => (
          <div key={labelKey} className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <Field label={label}>
              <TextInput
                value={page.counterText[labelKey] || ""}
                onChange={(event) => updateCounter({ [labelKey]: event.target.value })}
                placeholder={label}
              />
            </Field>
            <Toggle
              label={`Mostrar ${label.toLowerCase()}`}
              checked={Boolean(page.counterText[showKey])}
              onChange={(checked) => updateCounter({ [showKey]: checked })}
            />
          </div>
        ))}
      </div>
    </div>,

    // 5 — Wrapped
    <div key="wrapped" className="space-y-5">
      <SectionHeader title="Estilo Spotify Wrapped" description="Uma seção cinematográfica estilo Wrapped." />
      <Toggle
        label="Ativar seção Wrapped"
        description="Uma tela dramática com pilares verdes animados"
        checked={page.wrappedSectionEnabled}
        onChange={(wrappedSectionEnabled) => updatePage({ wrappedSectionEnabled })}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Horário no topo">
          <TextInput value={page.wrappedTime || ""} placeholder="22:19" onChange={(event) => updatePage({ wrappedTime: event.target.value })} />
        </Field>
        <Field label="Cor de destaque">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={page.wrappedAccentColor || "#1ed760"}
              onChange={(event) => updatePage({ wrappedAccentColor: event.target.value })}
              className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-white/12 bg-transparent"
            />
            <TextInput value={page.wrappedAccentColor || "#1ed760"} onChange={(event) => updatePage({ wrappedAccentColor: event.target.value })} />
          </div>
        </Field>
      </div>
      <Field label="Título central" hint="Se ficar vazio, usa os nomes do casal.">
        <TextInput value={page.wrappedTitle || ""} placeholder={[page.senderName, page.receiverName].filter(Boolean).join(" e ") || "Bruno e Nathallie"} onChange={(event) => updatePage({ wrappedTitle: event.target.value })} />
      </Field>
      <Field label="Texto abaixo">
        <TextArea value={page.wrappedSubtitle || ""} onChange={(event) => updatePage({ wrappedSubtitle: event.target.value })} placeholder="Os momentos que marcaram essa relação" />
      </Field>
    </div>,

    // 6 — Timeline
    <div key="timeline" className="space-y-5">
      <SectionHeader title="Linha do Tempo" description="Momentos especiais em ordem cronológica." />
      <Toggle
        label="Ativar Linha do Tempo Mágica"
        checked={page.timelineEnabled}
        onChange={(timelineEnabled) => updatePage({ timelineEnabled })}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título da timeline">
          <TextInput value={page.timelineTitle || ""} onChange={(event) => updatePage({ timelineTitle: event.target.value })} placeholder="Nossa história" />
        </Field>
        <Field label="Subtítulo">
          <TextInput value={page.timelineSubtitle || ""} onChange={(event) => updatePage({ timelineSubtitle: event.target.value })} />
        </Field>
      </div>
      <Field label="Texto de encerramento">
        <TextInput value={page.timelineEndText || ""} onChange={(event) => updatePage({ timelineEndText: event.target.value })} placeholder="E a história continua..." />
      </Field>
      <RomanticButton onClick={addTimelineItem}>
        <Plus className="h-4 w-4" />
        Adicionar momento
      </RomanticButton>
      <SortableList
        items={page.timelineItems}
        onChange={(timelineItems) => updatePage({ timelineItems })}
        render={(item) => (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3 pl-10">
            {item.imageUrl ? (
              isVideoUrl(item.imageUrl) ? (
                <video src={item.imageUrl} controls className="aspect-video w-full rounded-xl object-cover" />
              ) : (
                <img src={item.imageUrl} alt="" className="aspect-video w-full rounded-xl object-cover" />
              )
            ) : null}
            <PhotoUploader label="Foto do momento" onUploaded={(imageUrl) => updateTimelineItem(item.id, { imageUrl })} />
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput type="date" value={item.date || ""} onChange={(event) => updateTimelineItem(item.id, { date: event.target.value })} />
              <TextInput value={item.title || ""} placeholder="Título" onChange={(event) => updateTimelineItem(item.id, { title: event.target.value })} />
            </div>
            <TextArea value={item.description || ""} placeholder="Descrição do momento" onChange={(event) => updateTimelineItem(item.id, { description: event.target.value })} />
            <TextInput value={item.photoCaption || ""} placeholder="Legenda da foto (polaroid)" onChange={(event) => updateTimelineItem(item.id, { photoCaption: event.target.value })} />
            <RomanticButton variant="danger" onClick={() => updatePage({ timelineItems: page.timelineItems.filter((entry) => entry.id !== item.id) })}>
              <Trash2 className="h-4 w-4" />
              Excluir momento
            </RomanticButton>
          </div>
        )}
      />
    </div>,

    // 7 — Palavra
    <div key="word" className="space-y-5">
      <SectionHeader title="Jogo da Palavra Secreta" description="Um mini-game personalizado para ela descobrir." />
      <Toggle
        label="Ativar Jogo da Palavra"
        checked={page.wordGame.enabled}
        onChange={(enabled) => updateWordGame({ enabled })}
      />
      <Field label="Palavra secreta" hint="Entre 3 e 10 letras. Acentos são removidos automaticamente.">
        <TextInput
          value={page.wordGame.secretWord || ""}
          onChange={(event) => updateWordGame({ secretWord: event.target.value })}
          placeholder="AMOR"
          maxLength={10}
        />
        {page.wordGame.secretWord ? (
          <div className="mt-2 flex gap-1">
            {normalizeWord(page.wordGame.secretWord).split("").map((letter, i) => (
              <span key={i} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/8 text-sm font-bold text-white">
                {letter}
              </span>
            ))}
          </div>
        ) : null}
      </Field>
      <Field label="Dica">
        <TextInput value={page.wordGame.hint || ""} onChange={(event) => updateWordGame({ hint: event.target.value })} placeholder="Uma pista sobre a palavra..." />
      </Field>
      <Field label="Mensagem ao acertar">
        <TextArea value={page.wordGame.successMessage || ""} onChange={(event) => updateWordGame({ successMessage: event.target.value })} placeholder="Parabéns! Você acertou! ❤️" />
      </Field>
    </div>,

    // 8 — Mapa
    <div key="map" className="space-y-5">
      <SectionHeader title="Nossa Jornada no Mapa" description="Lugares especiais da história de vocês." />
      <Toggle
        label="Ativar mapa afetivo"
        checked={page.mapSectionEnabled}
        onChange={(mapSectionEnabled) => updatePage({ mapSectionEnabled })}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título do mapa">
          <TextInput value={page.mapTitle || ""} onChange={(event) => updatePage({ mapTitle: event.target.value })} placeholder="Nossa Jornada no Mapa" />
        </Field>
        <Field label="Subtítulo">
          <TextInput value={page.mapSubtitle || ""} onChange={(event) => updatePage({ mapSubtitle: event.target.value })} placeholder="Lugares que marcaram nossa história" />
        </Field>
      </div>
      <RomanticButton onClick={addMapLocation}>
        <Plus className="h-4 w-4" />
        Adicionar local
      </RomanticButton>
      <SortableList
        items={page.mapLocations}
        onChange={(mapLocations) => updatePage({ mapLocations })}
        render={(location) => (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3 pl-10">
            <CityAutocomplete
              onSelect={(city) =>
                updateMapLocation(location.id, {
                  placeName: city.placeName,
                  lat: city.lat,
                  lng: city.lng
                })
              }
            />
            {location.imageUrl ? (
              isVideoUrl(location.imageUrl) ? (
                <video src={location.imageUrl} controls className="aspect-video w-full rounded-xl object-cover" />
              ) : (
                <img src={location.imageUrl} alt="" className="aspect-video w-full rounded-xl object-cover" />
              )
            ) : null}
            <PhotoUploader label="Foto do local" onUploaded={(imageUrl) => updateMapLocation(location.id, { imageUrl })} />
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput value={location.placeName || ""} placeholder="Nome do local" onChange={(event) => updateMapLocation(location.id, { placeName: event.target.value })} />
              <TextInput value={location.placeNickname || ""} placeholder="Apelido carinhoso" onChange={(event) => updateMapLocation(location.id, { placeNickname: event.target.value })} />
              <TextInput type="date" value={location.date || ""} onChange={(event) => updateMapLocation(location.id, { date: event.target.value })} />
              <TextInput value={location.polaroidText || ""} placeholder="Texto da polaroid" onChange={(event) => updateMapLocation(location.id, { polaroidText: event.target.value })} />
            </div>
            <TextArea value={location.message || ""} placeholder="Mensagem sobre esse lugar especial" onChange={(event) => updateMapLocation(location.id, { message: event.target.value })} />
            <RomanticButton variant="danger" onClick={() => updatePage({ mapLocations: page.mapLocations.filter((entry) => entry.id !== location.id) })}>
              <Trash2 className="h-4 w-4" />
              Excluir local
            </RomanticButton>
          </div>
        )}
      />
    </div>,

    // 9 — Estrelas
    <div key="stars" className="space-y-5">
      <SectionHeader title="Mapa das Estrelas" description="O céu no momento especial de vocês." />
      <Toggle
        label="Ativar Mapa das Estrelas"
        checked={page.starSectionEnabled}
        onChange={(starSectionEnabled) => updatePage({ starSectionEnabled })}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome no topo" hint="Se vazio, usa os nomes do casal.">
          <TextInput value={page.starTitle || ""} onChange={(event) => updatePage({ starTitle: event.target.value })} />
        </Field>
        <Field label="Local">
          <TextInput value={page.starLocation || ""} placeholder="Pires do Rio, GO, Brasil" onChange={(event) => updatePage({ starLocation: event.target.value })} />
        </Field>
      </div>
      <Field label="Frase das estrelas">
        <TextArea value={page.starPhrase || ""} onChange={(event) => updatePage({ starPhrase: event.target.value })} placeholder="O céu quando nossos mundos se colidiram" />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Data e hora">
          <TextInput type="datetime-local" value={page.starDateTime || ""} onChange={(event) => updatePage({ starDateTime: event.target.value })} />
        </Field>
        <Field label="Latitude">
          <TextInput
            type="number"
            step="0.0001"
            value={page.starLatitude ?? ""}
            onChange={(event) => updatePage({ starLatitude: event.target.value ? Number(event.target.value) : null })}
            placeholder="-17.2985"
          />
        </Field>
        <Field label="Longitude">
          <TextInput
            type="number"
            step="0.0001"
            value={page.starLongitude ?? ""}
            onChange={(event) => updatePage({ starLongitude: event.target.value ? Number(event.target.value) : null })}
            placeholder="-48.2809"
          />
        </Field>
      </div>
    </div>,

    // 10 — Publicar
    <div key="publish" className="space-y-5">
      <SectionHeader title="Publicar Presente" description="Finalize e compartilhe com ela." />
      <GlassCard variant="accent">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${page.isPublished ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" : "bg-white/25"}`} />
              <p className="text-sm text-white/55">Status</p>
            </div>
            <h3 className="mt-1 text-2xl font-bold text-white">{page.isPublished ? "✓ Publicado" : "Rascunho"}</h3>
            <p className="mt-1 text-sm text-white/45">{page.views} visualizações</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RomanticButton onClick={() => save(false)} disabled={saving}>
              <Save className="h-4 w-4" />
              Salvar rascunho
            </RomanticButton>
            <RomanticButton onClick={() => save(true)} disabled={saving} variant={page.isPublished ? "secondary" : "primary"}>
              <Send className="h-4 w-4" />
              {page.isPublished ? "Reeditar" : "Publicar agora"}
            </RomanticButton>
            {page.isPublished ? (
              <RomanticButton variant="secondary" onClick={() => save(false)} disabled={saving}>
                Despublicar
              </RomanticButton>
            ) : null}
          </div>
        </div>
      </GlassCard>
      <Field label="URL pública">
        <div className="flex gap-2">
          <TextInput readOnly value={url} className="font-mono text-xs" />
          <RomanticButton variant="secondary" onClick={() => navigator.clipboard.writeText(url)}>
            <Copy className="h-4 w-4" />
          </RomanticButton>
          <a href={url} target="_blank">
            <RomanticButton variant="secondary">
              <Eye className="h-4 w-4" />
            </RomanticButton>
          </a>
        </div>
      </Field>
      <QRCodeCard url={url} />
    </div>
  ];

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6">
      {/* Mobile: compact step nav at top */}
      <div className="lg:hidden mb-4">
        <GlassCard className="p-3">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-rose/14 px-3 py-1 text-xs font-semibold text-rose">
                <Heart className="h-3.5 w-3.5" />
                Editor em tempo real
              </p>
              <h1 className="mt-3 font-serif text-2xl font-bold text-white">Monte o presente</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {dirty ? <span className="rounded-full bg-gold/14 px-3 py-1 text-xs font-semibold text-gold">● Não salvo</span> : null}
              <RomanticButton onClick={() => save()} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Salvando..." : "Salvar"}
              </RomanticButton>
            </div>
          </div>
          {/* Mobile compact nav */}
          <div className="overflow-x-auto soft-scrollbar">
            <div className="flex gap-1.5 pb-1 min-w-max">
              {editorSteps.map((s, index) => {
                const Icon = s.icon;
                const isActive = step === index;
                return (
                  <button
                    key={s.label}
                    onClick={() => setStep(index)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? "border-rose/50 bg-rose/14 text-white"
                        : "border-white/10 bg-white/[0.04] text-white/52"
                    }`}
                  >
                    <Icon className={`h-3 w-3 ${isActive ? "text-rose" : "text-white/40"}`} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
          {error ? <div className="mt-3 rounded-xl border border-red-300/20 bg-red-500/15 p-3 text-sm text-red-100">{error}</div> : null}
        </GlassCard>
      </div>

      {/* Desktop: 3-column layout — sidebar | content | phone preview */}
      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)_400px] lg:gap-5">

        {/* Left sidebar — desktop only */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-3">
            {/* Brand + save */}
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose/16 border border-rose/22">
                  <Heart className="h-4 w-4 text-rose animate-heartbeat" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">Editor</p>
                  <p className="text-[10px] text-white/38 leading-tight">tempo real</p>
                </div>
              </div>
              {dirty ? (
                <div className="mb-3 rounded-lg bg-gold/10 border border-gold/20 px-3 py-2 text-xs font-semibold text-gold">
                  ● Alterações não salvas
                </div>
              ) : null}
              <RomanticButton onClick={() => save()} disabled={saving} className="w-full">
                <Save className="h-3.5 w-3.5" />
                {saving ? "Salvando..." : "Salvar"}
              </RomanticButton>
            </GlassCard>

            {/* Navigation */}
            <GlassCard className="p-3">
              <EditorStepNavigation active={step} onChange={setStep} filledSteps={filledSteps} />
            </GlassCard>

            {error ? (
              <div className="rounded-xl border border-red-300/20 bg-red-500/15 p-3 text-xs text-red-100">
                {error}
              </div>
            ) : null}
          </div>
        </aside>

        {/* Center — section content */}
        <section className="min-w-0">
          <GlassCard>
            {/* Section context header — desktop */}
            <div className="hidden lg:flex items-center gap-3 mb-5 pb-4 border-b border-white/8">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose/14 border border-rose/22">
                {currentStep && <currentStep.icon className="h-4 w-4 text-rose" />}
              </span>
              <div>
                <p className="font-bold text-white text-sm">{currentStep?.label}</p>
                <p className="text-xs text-white/42">{currentStep?.hint}</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs text-white/28 font-semibold tabular-nums">{step + 1}/{editorSteps.length}</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {sections[step]}
              </motion.div>
            </AnimatePresence>
          </GlassCard>

          {/* Desktop: prev/next nav */}
          <div className="hidden lg:flex justify-between mt-3 gap-2">
            <RomanticButton variant="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              ← Anterior
            </RomanticButton>
            <RomanticButton
              variant={step === editorSteps.length - 1 ? "primary" : "secondary"}
              onClick={() => setStep(Math.min(editorSteps.length - 1, step + 1))}
              disabled={step === editorSteps.length - 1}
            >
              Próximo →
            </RomanticButton>
          </div>
        </section>

        {/* Right — phone preview */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <PhonePreview page={page} />
          </div>
        </aside>
      </div>
    </main>
  );
}
