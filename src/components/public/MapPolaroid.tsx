"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface MapPolaroidProps {
  lat: number;
  lng: number;
  imageUrl?: string | null;
  polaroidText?: string | null;
  date?: string | null;
  accentColor: string;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  }).format(d);
}

const HEART_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</svg>`;

export default function MapPolaroid({
  lat,
  lng,
  imageUrl,
  polaroidText,
  date,
  accentColor
}: MapPolaroidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    let isCancelled = false;

    import("leaflet").then((L) => {
      if (isCancelled || !containerRef.current) return;

      const dateStr = formatDate(date);

      // Build the polaroid icon HTML using absolute positioning.
      // The outer container is a fixed 32x32px matching the heart pin,
      // and the polaroid floats absolutely above it.
      const polaroidHtml = imageUrl
        ? `<div style="position:relative;width:32px;height:32px;">
            <!-- Heart Pin (Centered at coordinate point) -->
            <div style="width:32px;height:32px;border-radius:50%;background:${accentColor};
                        display:flex;align-items:center;justify-content:center;
                        box-shadow:0 4px 12px rgba(0,0,0,0.45);">
              ${HEART_SVG}
            </div>
            <!-- Polaroid Card (Floats above the pin) -->
            <div style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%) rotate(-2deg);width:144px;
                        background:#fff;padding:8px;padding-bottom:32px;border-radius:2px;
                        box-shadow:0 10px 36px rgba(0,0,0,0.65);text-align:center;color:#1a1a2e;user-select:none;">
              <img src="${imageUrl}" style="width:100%;aspect-ratio:4/5;object-fit:cover;display:block;" alt="" />
              ${polaroidText ? `<p style="margin:6px 0 0;font-family:Georgia,serif;font-size:10px;line-height:1.3;white-space:normal;">${polaroidText}</p>` : ""}
              ${dateStr ? `<p style="margin:2px 0 0;font-size:9px;color:#888;">${dateStr}</p>` : ""}
            </div>
          </div>`
        : `<div style="position:relative;width:32px;height:32px;">
            <div style="width:32px;height:32px;border-radius:50%;background:${accentColor};
                        display:flex;align-items:center;justify-content:center;
                        box-shadow:0 4px 12px rgba(0,0,0,0.45);">
              ${HEART_SVG}
            </div>
          </div>`;

      const icon = L.divIcon({
        html: polaroidHtml,
        // Center the 32x32px marker on the lat/lng coordinates
        iconAnchor: [16, 16],
        className: ""
      });

      if (!mapRef.current) {
        // Create new map
        const map = L.map(containerRef.current, {
          center: [lat, lng],
          zoom: 15,
          attributionControl: false,
          zoomControl: true
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19
        }).addTo(map);

        const marker = L.marker([lat, lng], { icon, interactive: false }).addTo(map);

        mapRef.current = map;
        markerRef.current = marker;
      } else {
        // Update existing map and marker
        const map = mapRef.current;
        const marker = markerRef.current;

        map.setView([lat, lng], 15);
        if (marker) {
          marker.setLatLng([lat, lng]);
          marker.setIcon(icon);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [lat, lng, imageUrl, polaroidText, date, accentColor]);

  return <div ref={containerRef} className="h-96 w-full" />;
}
