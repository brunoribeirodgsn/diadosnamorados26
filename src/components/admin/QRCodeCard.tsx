"use client";

import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function QRCodeCard({ url }: { url: string }) {
  return (
    <GlassCard className="flex items-center gap-4">
      <div className="rounded-2xl bg-white p-3 text-ink">
        {url ? <QRCodeSVG value={url} size={112} /> : <QrCode className="h-20 w-20" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">QR Code</p>
        <p className="mt-1 text-xs leading-5 text-white/55">Perfeito para imprimir em um cartao ou enviar junto com a surpresa.</p>
      </div>
    </GlassCard>
  );
}
