import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LovePageDraft } from "@/types/love-page";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeWord(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
}

export function dateInputValue(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function dateTimeInputValue(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export function publicUrl(slug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/p/${slug}`;
}

export function calculateTogetherTime(start?: string | null) {
  if (!start) return null;
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return null;
  const now = new Date();
  let seconds = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / 1000));
  const years = Math.floor(seconds / 31536000);
  seconds -= years * 31536000;
  const months = Math.floor(seconds / 2592000);
  seconds -= months * 2592000;
  const days = Math.floor(seconds / 86400);
  seconds -= days * 86400;
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return { years, months, days, hours, minutes, seconds };
}

export function romanticShareText(page: LovePageDraft) {
  const names = [page.senderName, page.receiverName].filter(Boolean).join(" e ");
  return encodeURIComponent(
    `${page.title}${names ? ` de ${names}` : ""}: ${publicUrl(page.slug)}`
  );
}

export function isVideoUrl(url?: string | null) {
  return Boolean(url && /\.(mp4|webm|mov)(\?|$)/i.test(url));
}
