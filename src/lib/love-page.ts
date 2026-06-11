import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  defaultCounterText,
  defaultLovePage,
  type LovePageDraft,
  type MapLocationDraft,
  type PhotoItem,
  type TimelineItemDraft
} from "@/types/love-page";
import { dateInputValue, dateTimeInputValue, normalizeSlug, normalizeWord } from "@/lib/utils";

export const lovePageInclude = {
  music: true,
  counterText: true,
  wordGame: true,
  photos: { orderBy: { order: "asc" as const } },
  timelineItems: { orderBy: { order: "asc" as const } },
  mapLocations: { orderBy: { order: "asc" as const } }
};

export type LovePageWithRelations = Prisma.LovePageGetPayload<{
  include: typeof lovePageInclude;
}>;

export const lovePageSchema = z.object({
  slug: z
    .string()
    .min(3, "O slug precisa ter pelo menos 3 caracteres.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras, números e hífen."),
  title: z.string().min(1, "Informe um título."),
  senderName: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  relationshipStartDate: z.string().optional().nullable(),
  specialDate: z.string().optional().nullable(),
  mainPhrase: z.string().optional().nullable(),
  specialMessage: z.string().optional().nullable(),
  finalMessage: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  theme: z.string().optional().nullable(),
  primaryColor: z.string().optional().nullable(),
  secondaryColor: z.string().optional().nullable(),
  isPublished: z.boolean(),
  views: z.number().default(0),
  timelineEnabled: z.boolean().default(true),
  timelineTitle: z.string().optional().nullable(),
  timelineSubtitle: z.string().optional().nullable(),
  timelineEndText: z.string().optional().nullable(),
  wrappedSectionEnabled: z.boolean().default(true),
  wrappedTime: z.string().optional().nullable(),
  wrappedTitle: z.string().optional().nullable(),
  wrappedSubtitle: z.string().optional().nullable(),
  wrappedAccentColor: z.string().optional().nullable(),
  mapSectionEnabled: z.boolean().default(true),
  mapTitle: z.string().optional().nullable(),
  mapSubtitle: z.string().optional().nullable(),
  starSectionEnabled: z.boolean().default(true),
  starTitle: z.string().optional().nullable(),
  starPhrase: z.string().optional().nullable(),
  starLocation: z.string().optional().nullable(),
  starDateTime: z.string().optional().nullable(),
  starLatitude: z.number().optional().nullable(),
  starLongitude: z.number().optional().nullable(),
  music: z
    .object({
      title: z.string().optional().nullable(),
      artist: z.string().optional().nullable(),
      url: z.string().optional().nullable(),
      thumbnail: z.string().optional().nullable(),
      duration: z.string().optional().nullable(),
      provider: z.string().optional().nullable()
    })
    .optional()
    .nullable(),
  counterText: z.object({
    title: z.string().optional().nullable(),
    subtitle: z.string().optional().nullable(),
    sinceText: z.string().optional().nullable(),
    messageTitle: z.string().optional().nullable(),
    yearsLabel: z.string().optional().nullable(),
    monthsLabel: z.string().optional().nullable(),
    daysLabel: z.string().optional().nullable(),
    hoursLabel: z.string().optional().nullable(),
    minutesLabel: z.string().optional().nullable(),
    secondsLabel: z.string().optional().nullable(),
    showYears: z.boolean(),
    showMonths: z.boolean(),
    showDays: z.boolean(),
    showHours: z.boolean(),
    showMinutes: z.boolean(),
    showSeconds: z.boolean()
  }),
  wordGame: z.object({
    enabled: z.boolean(),
    secretWord: z.string().optional().nullable(),
    hint: z.string().optional().nullable(),
    successMessage: z.string().optional().nullable()
  }),
  photos: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      caption: z.string().optional().nullable(),
      order: z.number(),
      isCover: z.boolean()
    })
  ),
  timelineItems: z.array(
    z.object({
      id: z.string(),
      imageUrl: z.string().optional().nullable(),
      date: z.string().optional().nullable(),
      title: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      photoCaption: z.string().optional().nullable(),
      order: z.number()
    })
  ),
  mapLocations: z.array(
    z.object({
      id: z.string(),
      imageUrl: z.string().optional().nullable(),
      placeName: z.string().optional().nullable(),
      placeNickname: z.string().optional().nullable(),
      date: z.string().optional().nullable(),
      message: z.string().optional().nullable(),
      polaroidText: z.string().optional().nullable(),
      lat: z.number().optional().nullable(),
      lng: z.number().optional().nullable(),
      order: z.number()
    })
  )
}).superRefine((data, ctx) => {
  if (!data.wordGame.enabled) return;
  const word = normalizeWord(data.wordGame.secretWord || "");
  if (word.length < 3 || word.length > 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["wordGame", "secretWord"],
      message: "A palavra secreta precisa ter entre 3 e 10 letras."
    });
  }
});

function nullableDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toLovePageDraft(page: LovePageWithRelations): LovePageDraft {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    senderName: page.senderName,
    receiverName: page.receiverName,
    relationshipStartDate: dateInputValue(page.relationshipStartDate),
    specialDate: dateInputValue(page.specialDate),
    mainPhrase: page.mainPhrase,
    specialMessage: page.specialMessage,
    finalMessage: page.finalMessage,
    coverImageUrl: page.coverImageUrl,
    theme: page.theme,
    primaryColor: page.primaryColor,
    secondaryColor: page.secondaryColor,
    timelineEnabled: page.timelineEnabled,
    timelineTitle: page.timelineTitle,
    timelineSubtitle: page.timelineSubtitle,
    timelineEndText: page.timelineEndText,
    wrappedSectionEnabled: page.wrappedSectionEnabled,
    wrappedTime: page.wrappedTime,
    wrappedTitle: page.wrappedTitle,
    wrappedSubtitle: page.wrappedSubtitle,
    wrappedAccentColor: page.wrappedAccentColor,
    mapSectionEnabled: page.mapSectionEnabled,
    mapTitle: page.mapTitle,
    mapSubtitle: page.mapSubtitle,
    starSectionEnabled: page.starSectionEnabled,
    starTitle: page.starTitle,
    starPhrase: page.starPhrase,
    starLocation: page.starLocation,
    starDateTime: dateTimeInputValue(page.starDateTime),
    starLatitude: page.starLatitude,
    starLongitude: page.starLongitude,
    isPublished: page.isPublished,
    views: page.views,
    music: page.music
      ? {
          title: page.music.title,
          artist: page.music.artist,
          url: page.music.url,
          thumbnail: page.music.thumbnail,
          duration: page.music.duration,
          provider:
            page.music.provider === "youtube" || page.music.provider === "spotify"
              ? page.music.provider
              : undefined
        }
      : null,
    counterText: page.counterText ?? defaultCounterText,
    wordGame: page.wordGame ?? defaultLovePage.wordGame,
    photos: page.photos.map((photo): PhotoItem => ({
      id: photo.id,
      url: photo.url,
      caption: photo.caption,
      order: photo.order,
      isCover: photo.isCover
    })),
    timelineItems: page.timelineItems.map((item): TimelineItemDraft => ({
      id: item.id,
      imageUrl: item.imageUrl,
      date: dateInputValue(item.date),
      title: item.title,
      description: item.description,
      photoCaption: item.photoCaption,
      order: item.order
    })),
    mapLocations: page.mapLocations.map((item): MapLocationDraft => ({
      id: item.id,
      imageUrl: item.imageUrl,
      placeName: item.placeName,
      placeNickname: item.placeNickname,
      date: dateInputValue(item.date),
      message: item.message,
      polaroidText: item.polaroidText,
      lat: item.lat,
      lng: item.lng,
      order: item.order
    }))
  };
}

export function createPrismaPayload(data: LovePageDraft, mode: "create" | "update" = "update") {
  const secretWord = normalizeWord(data.wordGame.secretWord || "");
  const musicData = data.music
    ? {
        title: data.music.title || null,
        artist: data.music.artist || null,
        url: data.music.url || null,
        thumbnail: data.music.thumbnail || null,
        duration: data.music.duration || null,
        provider: data.music.provider || null
      }
    : null;

  return {
    slug: normalizeSlug(data.slug),
    title: data.title,
    senderName: data.senderName || null,
    receiverName: data.receiverName || null,
    relationshipStartDate: nullableDate(data.relationshipStartDate),
    specialDate: nullableDate(data.specialDate),
    mainPhrase: data.mainPhrase || null,
    specialMessage: data.specialMessage || null,
    finalMessage: data.finalMessage || null,
    coverImageUrl: data.coverImageUrl || null,
    theme: data.theme || "midnight-rose",
    primaryColor: data.primaryColor || "#f45b8a",
    secondaryColor: data.secondaryColor || "#f3c677",
    timelineEnabled: data.timelineEnabled,
    timelineTitle: data.timelineTitle || null,
    timelineSubtitle: data.timelineSubtitle || null,
    timelineEndText: data.timelineEndText || null,
    wrappedSectionEnabled: data.wrappedSectionEnabled,
    wrappedTime: data.wrappedTime || null,
    wrappedTitle: data.wrappedTitle || null,
    wrappedSubtitle: data.wrappedSubtitle || null,
    wrappedAccentColor: data.wrappedAccentColor || null,
    mapSectionEnabled: data.mapSectionEnabled,
    mapTitle: data.mapTitle || null,
    mapSubtitle: data.mapSubtitle || null,
    starSectionEnabled: data.starSectionEnabled,
    starTitle: data.starTitle || null,
    starPhrase: data.starPhrase || null,
    starLocation: data.starLocation || null,
    starDateTime: nullableDate(data.starDateTime),
    starLatitude: data.starLatitude ?? null,
    starLongitude: data.starLongitude ?? null,
    isPublished: data.isPublished,
    music: musicData
      ? mode === "create"
        ? { create: musicData }
        : {
            upsert: {
              create: musicData,
              update: musicData
            }
          }
      : undefined,
    counterText:
      mode === "create"
        ? { create: data.counterText }
        : {
            upsert: {
              create: data.counterText,
              update: data.counterText
            }
          },
    wordGame:
      mode === "create"
        ? {
            create: {
              enabled: data.wordGame.enabled,
              secretWord: secretWord || null,
              hint: data.wordGame.hint || null,
              successMessage: data.wordGame.successMessage || null
            }
          }
        : {
            upsert: {
              create: {
                enabled: data.wordGame.enabled,
                secretWord: secretWord || null,
                hint: data.wordGame.hint || null,
                successMessage: data.wordGame.successMessage || null
              },
              update: {
                enabled: data.wordGame.enabled,
                secretWord: secretWord || null,
                hint: data.wordGame.hint || null,
                successMessage: data.wordGame.successMessage || null
              }
            }
          },
    photos: {
      ...(mode === "update" ? { deleteMany: {} } : {}),
      create: data.photos.map((photo, index) => ({
        url: photo.url,
        caption: photo.caption || null,
        order: index,
        isCover: photo.isCover
      }))
    },
    timelineItems: {
      ...(mode === "update" ? { deleteMany: {} } : {}),
      create: data.timelineItems.map((item, index) => ({
        imageUrl: item.imageUrl || null,
        date: nullableDate(item.date),
        title: item.title || null,
        description: item.description || null,
        photoCaption: item.photoCaption || null,
        order: index
      }))
    },
    mapLocations: {
      ...(mode === "update" ? { deleteMany: {} } : {}),
      create: data.mapLocations.map((item, index) => ({
        imageUrl: item.imageUrl || null,
        placeName: item.placeName || null,
        placeNickname: item.placeNickname || null,
        date: nullableDate(item.date),
        message: item.message || null,
        polaroidText: item.polaroidText || null,
        lat: item.lat ?? null,
        lng: item.lng ?? null,
        order: index
      }))
    }
  };
}
