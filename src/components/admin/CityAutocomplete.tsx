"use client";

import { MapPin, Search } from "lucide-react";
import { useState } from "react";
import type { CityResult } from "@/types/love-page";
import { Field, TextInput } from "@/components/admin/EditorFields";
import { RomanticButton } from "@/components/ui/RomanticButton";

export function CityAutocomplete({ onSelect }: { onSelect: (city: CityResult) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);

  async function search() {
    const response = await fetch("/api/cities/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    setResults(data.results || []);
  }

  return (
    <div className="space-y-3">
      <Field label="Digite a cidade/local">
        <div className="flex gap-2">
          <TextInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Barra Mansa" />
          <RomanticButton onClick={search}>
            <Search className="h-4 w-4" />
          </RomanticButton>
        </div>
      </Field>
      {results.map((city) => (
        <button
          type="button"
          key={`${city.placeName}-${city.lat}`}
          onClick={() => onSelect(city)}
          className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-left text-sm text-white/78"
        >
          <MapPin className="h-4 w-4 text-rose" />
          {city.placeName}, {city.state}, {city.country}
        </button>
      ))}
    </div>
  );
}
