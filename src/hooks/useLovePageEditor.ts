"use client";

import { create } from "zustand";
import { defaultLovePage, type LovePageDraft } from "@/types/love-page";
import { normalizeSlug } from "@/lib/utils";

type EditorState = {
  page: LovePageDraft;
  savedPage: LovePageDraft | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  dirty: boolean;
  setPage: (page: LovePageDraft) => void;
  updatePage: (patch: Partial<LovePageDraft>) => void;
  load: () => Promise<void>;
  save: (publish?: boolean) => Promise<void>;
};

export const useLovePageEditor = create<EditorState>((set, get) => ({
  page: defaultLovePage,
  savedPage: null,
  loading: true,
  saving: false,
  error: null,
  dirty: false,
  setPage: (page) => set({ page, savedPage: page, dirty: false }),
  updatePage: (patch) => {
    const current = get().page;
    const next = {
      ...current,
      ...patch,
      slug: patch.slug !== undefined ? normalizeSlug(patch.slug) : current.slug
    };
    set({ page: next, dirty: true });
  },
  load: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/love-page");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao carregar.");
      set({ page: data.page, savedPage: data.page, loading: false, dirty: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Falha ao carregar.",
        loading: false
      });
    }
  },
  save: async (publish) => {
    const current = get().page;
    const page = typeof publish === "boolean" ? { ...current, isPublished: publish } : current;
    set({ saving: true, error: null, page });
    try {
      const response = await fetch(page.id ? `/api/love-page/${page.id}` : "/api/love-page", {
        method: page.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Falha ao salvar.");
      set({ page: data.page, savedPage: data.page, dirty: false, saving: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Falha ao salvar.",
        saving: false
      });
    }
  }
}));
