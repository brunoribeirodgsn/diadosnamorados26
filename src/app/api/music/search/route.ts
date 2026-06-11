import { NextResponse } from "next/server";
import { mockMusic } from "@/lib/mock-music";
import type { MusicResult } from "@/types/love-page";

type SpotifyTrack = {
  name: string;
  duration_ms: number;
  external_urls?: { spotify?: string };
  album?: { images?: { url: string }[] };
  artists?: { name: string }[];
};

type YoutubeSearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
};

type YoutubeVideoItem = {
  id?: string;
  contentDetails?: { duration?: string };
};

function duration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function youtubeDuration(isoDuration = "") {
  const match = isoDuration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return "";

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function userFriendlySpotifyError(status: number, details: string) {
  if (status === 403 && details.toLowerCase().includes("premium")) {
    return "O Spotify bloqueou a busca porque o dono do app precisa ter uma assinatura Premium ativa. Vou usar outra fonte quando disponivel.";
  }

  return `A busca do Spotify falhou (${status}). Confira as credenciais e permissoes do app Spotify.`;
}

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel autenticar no Spotify.");
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

async function searchSpotify(query: string) {
  const token = await getSpotifyToken();
  if (!token) return null;

  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "track");
  url.searchParams.set("market", "BR");
  url.searchParams.set("limit", "8");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(userFriendlySpotifyError(response.status, details));
  }

  const data = (await response.json()) as { tracks?: { items?: SpotifyTrack[] } };
  return (data.tracks?.items || []).map((track) => ({
    title: track.name,
    artist: track.artists?.map((artist) => artist.name).join(", ") || "Spotify",
    url: track.external_urls?.spotify || "",
    thumbnail: track.album?.images?.[0]?.url || "",
    duration: duration(track.duration_ms),
    provider: "spotify" as const
  }));
}

async function searchYoutube(query: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("videoCategoryId", "10");
  searchUrl.searchParams.set("regionCode", "BR");
  searchUrl.searchParams.set("maxResults", "8");
  searchUrl.searchParams.set("key", apiKey);

  const searchResponse = await fetch(searchUrl);

  if (!searchResponse.ok) {
    throw new Error(`A busca do YouTube falhou (${searchResponse.status}). Confira a YOUTUBE_API_KEY.`);
  }

  const searchData = (await searchResponse.json()) as { items?: YoutubeSearchItem[] };
  const items = searchData.items || [];
  const videoIds = items.map((item) => item.id?.videoId).filter(Boolean) as string[];
  const durations = new Map<string, string>();

  if (videoIds.length > 0) {
    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("part", "contentDetails");
    videosUrl.searchParams.set("id", videoIds.join(","));
    videosUrl.searchParams.set("key", apiKey);

    const videosResponse = await fetch(videosUrl);
    if (videosResponse.ok) {
      const videosData = (await videosResponse.json()) as { items?: YoutubeVideoItem[] };
      for (const video of videosData.items || []) {
        if (video.id) durations.set(video.id, youtubeDuration(video.contentDetails?.duration));
      }
    }
  }

  return items.flatMap((item) => {
    const videoId = item.id?.videoId;
    if (!videoId) return [];

    return {
      title: decodeHtml(item.snippet?.title || "Musica no YouTube"),
      artist: decodeHtml(item.snippet?.channelTitle || "YouTube"),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        "",
      duration: durations.get(videoId) || "",
      provider: "youtube" as const
    };
  });
}

function searchMockMusic(normalized: string) {
  return mockMusic.filter((item) => {
    const haystack = `${item.title} ${item.artist}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

export async function POST(request: Request) {
  const { query = "" } = (await request.json().catch(() => ({}))) as { query?: string };
  const normalized = query.trim().toLowerCase();

  if (normalized.length < 2) {
    return NextResponse.json({ results: [], mock: false, message: "Digite pelo menos 2 caracteres." });
  }

  const messages: string[] = [];

  try {
    const results = await searchSpotify(query);
    if (results) return NextResponse.json({ results, mock: false });
  } catch (error) {
    messages.push(error instanceof Error ? error.message : "Erro no Spotify.");
  }

  try {
    const results = await searchYoutube(query);
    if (results) {
      return NextResponse.json({
        results,
        mock: false,
        message: messages[0] || null
      });
    }
  } catch (error) {
    messages.push(error instanceof Error ? error.message : "Erro no YouTube.");
  }

  const results: MusicResult[] = searchMockMusic(normalized);
  const configurationMessage =
    messages.length > 0
      ? messages.join(" ")
      : "Configure YOUTUBE_API_KEY ou SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET para buscar musicas reais.";

  return NextResponse.json({
    results,
    mock: true,
    message: results.length > 0 ? `${configurationMessage} Exibindo sugestoes locais.` : configurationMessage
  });
}
