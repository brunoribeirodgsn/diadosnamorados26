import { NextResponse } from "next/server";
import { mockCities } from "@/lib/mock-cities";
import type { CityResult } from "@/types/love-page";

export async function POST(request: Request) {
  const { query = "" } = (await request.json().catch(() => ({}))) as { query?: string };
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return NextResponse.json({ results: mockCities.slice(0, 5), mock: true });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmedQuery)}&format=json&limit=8&addressdetails=1&accept-language=pt-BR`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "DiaDosNamoradosDigital/1.0 (bruno.oc@live.com)"
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const results: CityResult[] = data.map((item) => {
        const displayNameParts = (item.display_name || "").split(",");
        const placeName = displayNameParts[0]?.trim() || "";
        const state = item.address?.state || item.address?.region || "";
        const country = item.address?.country || "";
        return {
          placeName,
          state,
          country,
          lat: Number(item.lat),
          lng: Number(item.lon)
        };
      });
      return NextResponse.json({ results, mock: false });
    }
  } catch (error) {
    console.error("Geocoding API failed, falling back to mock search:", error);
  }

  // Fallback to local mockCities filter
  const normalized = trimmedQuery
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const results = mockCities.filter((city) => {
    const haystack = `${city.placeName} ${city.state} ${city.country}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return haystack.includes(normalized);
  });

  return NextResponse.json({
    results: results.length ? results : mockCities.slice(0, 5),
    mock: true
  });
}
