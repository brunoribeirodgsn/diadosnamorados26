"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import type { MusicResult } from "@/types/love-page";
import { RomanticButton } from "@/components/ui/RomanticButton";
import { Field, TextInput } from "@/components/admin/EditorFields";

export function MusicSearch({ onSelect }: { onSelect: (music: MusicResult) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    const response = await fetch("/api/music/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    setResults(data.results || []);
    setMessage(data.error || data.message || null);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <Field label="Buscar música">
        <div className="flex gap-2">
          <TextInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Perfect, Ainda Bem..."
          />
          <RomanticButton onClick={search} disabled={loading}>
            <Search className="h-4 w-4" />
          </RomanticButton>
        </div>
      </Field>
      <div className="space-y-3">
        {message ? (
          <div className="rounded-xl border border-gold/20 bg-gold/10 p-3 text-sm text-gold">
            {message}
          </div>
        ) : null}
        {results.map((item) => (
          <div key={`${item.title}-${item.artist}`} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
            <img src={item.thumbnail} alt="" className="h-14 w-14 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{item.title}</p>
              <p className="truncate text-xs text-white/50">{item.artist} · {item.provider}</p>
            </div>
            <RomanticButton variant="secondary" onClick={() => onSelect(item)}>
              Selecionar
            </RomanticButton>
          </div>
        ))}
      </div>
    </div>
  );
}
