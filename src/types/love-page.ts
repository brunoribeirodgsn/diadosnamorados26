export type MusicProvider = "youtube" | "spotify";

export type MusicResult = {
  title: string;
  artist: string;
  url: string;
  thumbnail: string;
  duration: string;
  provider: MusicProvider;
};

export type CityResult = {
  placeName: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
};

export type PhotoItem = {
  id: string;
  url: string;
  caption?: string | null;
  order: number;
  isCover: boolean;
};

export type TimelineItemDraft = {
  id: string;
  imageUrl?: string | null;
  date?: string | null;
  title?: string | null;
  description?: string | null;
  photoCaption?: string | null;
  order: number;
};

export type MapLocationDraft = {
  id: string;
  imageUrl?: string | null;
  placeName?: string | null;
  placeNickname?: string | null;
  date?: string | null;
  message?: string | null;
  polaroidText?: string | null;
  lat?: number | null;
  lng?: number | null;
  order: number;
};

export type CounterTextDraft = {
  title?: string | null;
  subtitle?: string | null;
  sinceText?: string | null;
  messageTitle?: string | null;
  yearsLabel?: string | null;
  monthsLabel?: string | null;
  daysLabel?: string | null;
  hoursLabel?: string | null;
  minutesLabel?: string | null;
  secondsLabel?: string | null;
  showYears: boolean;
  showMonths: boolean;
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
};

export type WordGameDraft = {
  enabled: boolean;
  secretWord?: string | null;
  hint?: string | null;
  successMessage?: string | null;
};

export type LovePageDraft = {
  id?: string;
  slug: string;
  title: string;
  senderName?: string | null;
  receiverName?: string | null;
  relationshipStartDate?: string | null;
  specialDate?: string | null;
  mainPhrase?: string | null;
  specialMessage?: string | null;
  finalMessage?: string | null;
  coverImageUrl?: string | null;
  theme?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  isPublished: boolean;
  views: number;
  music?: {
    title?: string | null;
    artist?: string | null;
    url?: string | null;
    thumbnail?: string | null;
    duration?: string | null;
    provider?: MusicProvider | string | null;
  } | null;
  counterText: CounterTextDraft;
  wordGame: WordGameDraft;
  photos: PhotoItem[];
  timelineEnabled: boolean;
  timelineTitle?: string | null;
  timelineSubtitle?: string | null;
  timelineEndText?: string | null;
  timelineItems: TimelineItemDraft[];
  wrappedSectionEnabled: boolean;
  wrappedTime?: string | null;
  wrappedTitle?: string | null;
  wrappedSubtitle?: string | null;
  wrappedAccentColor?: string | null;
  mapSectionEnabled: boolean;
  mapTitle?: string | null;
  mapSubtitle?: string | null;
  starSectionEnabled: boolean;
  starTitle?: string | null;
  starPhrase?: string | null;
  starLocation?: string | null;
  starDateTime?: string | null;
  starLatitude?: number | null;
  starLongitude?: number | null;
  mapLocations: MapLocationDraft[];
};

export const defaultCounterText: CounterTextDraft = {
  title: "O tempo que estamos juntos",
  subtitle: "Cada segundo com você importa.",
  sinceText: "Juntos desde",
  messageTitle: "Nossa história em números",
  yearsLabel: "anos",
  monthsLabel: "meses",
  daysLabel: "dias",
  hoursLabel: "horas",
  minutesLabel: "minutos",
  secondsLabel: "segundos",
  showYears: true,
  showMonths: true,
  showDays: true,
  showHours: true,
  showMinutes: true,
  showSeconds: true
};

export const defaultLovePage: LovePageDraft = {
  slug: "nossa-historia",
  title: "A nossa história",
  senderName: "",
  receiverName: "",
  relationshipStartDate: "",
  specialDate: "",
  mainPhrase: "Cada segundo ao seu lado virou parte da minha história favorita.",
  specialMessage:
    "Desde que você chegou, tudo ficou mais bonito. Cada detalhe, cada sorriso e cada momento ao seu lado virou uma lembrança que eu quero guardar para sempre.",
  finalMessage: "E isso é só o começo da nossa história.",
  coverImageUrl: "",
  theme: "midnight-rose",
  primaryColor: "#f45b8a",
  secondaryColor: "#f3c677",
  isPublished: false,
  views: 0,
  music: null,
  counterText: defaultCounterText,
  wordGame: {
    enabled: false,
    secretWord: "AMOR",
    hint: "A palavra que resume a gente.",
    successMessage: "Você acertou. É claro que a resposta era amor."
  },
  photos: [],
  timelineEnabled: true,
  timelineTitle: "Nossa linha do tempo mágica",
  timelineSubtitle: "Alguns momentos que marcaram a nossa história.",
  timelineEndText: "E isso é só o começo...",
  timelineItems: [],
  wrappedSectionEnabled: true,
  wrappedTime: "22:19",
  wrappedTitle: "",
  wrappedSubtitle: "Os momentos que marcaram essa relação",
  wrappedAccentColor: "#1ed760",
  mapSectionEnabled: true,
  mapTitle: "Nossa jornada no mapa",
  mapSubtitle: "Lugares que guardam partes da nossa história.",
  starSectionEnabled: true,
  starTitle: "",
  starPhrase: "O céu quando nossos mundos se colidiram",
  starLocation: "",
  starDateTime: "",
  starLatitude: null,
  starLongitude: null,
  mapLocations: []
};
