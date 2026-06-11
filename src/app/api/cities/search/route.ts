import { NextResponse } from "next/server";
import { mockCities } from "@/lib/mock-cities";

export async function POST(request: Request) {
  const { query = "" } = (await request.json().catch(() => ({}))) as { query?: string };
  const normalized = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  const results = mockCities.filter((city) => {
    const haystack = `${city.placeName} ${city.state} ${city.country}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return !normalized || haystack.includes(normalized);
  });

  return NextResponse.json({ results: results.length ? results : mockCities.slice(0, 5), mock: true });
}
