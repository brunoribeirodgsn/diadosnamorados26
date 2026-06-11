"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function PhotoUploader({
  onUploaded,
  onUploadedMany,
  label = "Enviar arquivo",
  multiple = false,
  maxFiles
}: {
  onUploaded: (url: string) => void;
  onUploadedMany?: (urls: string[]) => void;
  label?: string;
  multiple?: boolean;
  maxFiles?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  async function uploadOne(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Falha no upload.");
    }

    return data.url as string;
  }

  async function upload(files?: FileList | null) {
    if (!files?.length) return;

    const selectedFiles = Array.from(files);
    const allowedFiles = maxFiles !== undefined ? selectedFiles.slice(0, Math.max(maxFiles, 0)) : selectedFiles;

    if (!allowedFiles.length) {
      setError("Limite de 30 arquivos atingido.");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: allowedFiles.length });

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (const [index, file] of allowedFiles.entries()) {
      setProgress({ current: index + 1, total: allowedFiles.length });
      try {
        uploadedUrls.push(await uploadOne(file));
      } catch (error) {
        errors.push(error instanceof Error ? error.message : "Falha no upload.");
      }
    }

    setLoading(false);
    setProgress(null);

    if (uploadedUrls.length) {
      if (multiple && onUploadedMany) {
        onUploadedMany(uploadedUrls);
      } else {
        uploadedUrls.forEach(onUploaded);
      }
    }

    const ignoredCount = selectedFiles.length - allowedFiles.length;
    if (errors.length || ignoredCount > 0) {
      const messages = [
        ...new Set(errors),
        ignoredCount > 0 ? `${ignoredCount} arquivo(s) ignorado(s) pelo limite de 30.` : null
      ].filter(Boolean);
      setError(messages.join(" "));
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          upload(event.target.files);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={cn(
          "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {loading && progress ? `Enviando ${progress.current}/${progress.total}` : label}
      </button>
      {error ? <p className="text-xs text-red-200">{error}</p> : null}
    </div>
  );
}
