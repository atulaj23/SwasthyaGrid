'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Phc } from '@/lib/store';

/* ── BRICS country accent colors ─────────────────────────────── */
const COUNTRY_ACCENT: Record<string, string> = {
  IN: '#1a6b3e', // India — deep green
  BR: '#2d6a4f', // Brazil — forest green
  RU: '#1d3461', // Russia — navy
  CN: '#7b1c1c', // China — deep red
  ZA: '#4a3728', // South Africa — earth brown
};

/* ── Status colours ───────────────────────────────────────────── */
const STATUS_COLORS = { CRITICAL: '#c0392b', WARNING: '#c27621', NORMAL: '#217a57' } as const;
const colorFor = (p: Phc, layer: string): string => {
  if (layer === 'BED_PRESSURE')       { const r = p.occupied / p.beds;    return r > .85 ? STATUS_COLORS.CRITICAL : r > .7  ? STATUS_COLORS.WARNING : STATUS_COLORS.NORMAL; }
  if (layer === 'PATIENT_SURGE')      { const r = p.footfall / p.baseline; return r > 1.25 ? STATUS_COLORS.CRITICAL : r > 1.1 ? STATUS_COLORS.WARNING : STATUS_COLORS.NORMAL; }
  if (layer === 'STAFF_AVAILABILITY') { const r = p.present / p.staff;     return r < .75 ? STATUS_COLORS.CRITICAL : r < .9  ? STATUS_COLORS.WARNING : STATUS_COLORS.NORMAL; }
  if (layer === 'MEDICINE_RISK')      return STATUS_COLORS[p.medicineRisk];
  return STATUS_COLORS[p.status];
};

/* ── Marker factory ───────────────────────────────────────────── */
const makeIcon = (p: Phc, layer: string, selected: boolean) => {
  const color    = colorFor(p, layer);
  const accent   = COUNTRY_ACCENT[p.code] ?? '#176b60';
  const isLojhara = p.name === 'Lojhara AAM-PHC';
  const size     = selected ? 22 : isLojhara ? 20 : 15;
  const border   = selected ? 3 : 2;
  const shadow   = selected
    ? `box-shadow:0 0 0 5px ${color}28,0 0 0 3px ${accent}44,0 1px 8px #0007;`
    : `box-shadow:0 1px 5px #0005;`;

  // Lojhara AAM-PHC: diamond (rotated square) — distinct landmark
  // All others: circle with country-accent border
  const shape = isLojhara
    ? `width:${size}px;height:${size}px;border-radius:3px;transform:rotate(45deg);background:${color};border:${border}px solid #fff;${shadow}`
    : selected
    ? `width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border}px solid #fff;${shadow}`
    : `width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border}px solid ${accent};${shadow}`;

  return L.divIcon({
    className: 'phc-marker',
    html: `<span aria-label="${p.name} – ${p.status}" style="display:inline-block;${isLojhara ? '' : ''}"><span style="${shape}"></span></span>`,
    iconSize:   [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
  });
};

/* ── HTML escape ──────────────────────────────────────────────── */
const esc = (v: string) => v.replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c] ?? c)
);

/* ── Popup content ────────────────────────────────────────────── */
const makePopup = (p: Phc, color: string): string => {
  const daysLeft   = p.dailyUse ? Math.floor(p.stock / p.dailyUse) : 999;
  const bedPct     = Math.round(p.occupied / p.beds * 100);
  const staffPct   = Math.round(p.present / p.staff * 100);
  const foot       = p.footfall > p.baseline
    ? `<span class="popup-up">↑${Math.round((p.footfall / p.baseline - 1) * 100)}%</span>`
    : `<span class="popup-ok">On plan</span>`;

  // Data transparency tag
  const srcTag = p.locationSource === 'verified'
    ? `<div class="popup-verified">✓ Verified location · Simulated metrics</div>`
    : `<div class="popup-sim">⚠ Illustrative location · Simulated metrics</div>`;

  return `
    <div class="popup-header">
      <div class="popup-name">${esc(p.name)}</div>
      <div class="popup-status" style="color:${color}">● ${p.status}</div>
    </div>
    <div class="popup-location">${esc(p.district)} · ${esc(p.region)} · ${esc(p.country)}</div>
    ${srcTag}
    <div class="popup-grid">
      <div class="popup-cell"><span>Medicine</span><strong class="${p.medicineRisk === 'CRITICAL' ? 'popup-red' : p.medicineRisk === 'WARNING' ? 'popup-amber' : ''}">${p.medicineRisk}</strong></div>
      <div class="popup-cell"><span>Stock</span><strong>${daysLeft < 999 ? daysLeft + 'd' : '—'}</strong></div>
      <div class="popup-cell"><span>Beds</span><strong class="${bedPct > 85 ? 'popup-red' : bedPct > 70 ? 'popup-amber' : ''}">${bedPct}%</strong></div>
      <div class="popup-cell"><span>Staff</span><strong class="${staffPct < 75 ? 'popup-red' : staffPct < 90 ? 'popup-amber' : ''}">${staffPct}%</strong></div>
      <div class="popup-cell"><span>Footfall</span><strong>${foot}</strong></div>
      <div class="popup-cell"><span>Population</span><strong>${p.population.toLocaleString()}</strong></div>
    </div>
    <button class="popup-link" data-phc="${p.id}">Open facility intelligence →</button>
  `;
};

/* ── Component ────────────────────────────────────────────────── */
export default function PhcMap({
  phcs, onSelect, layer, selectedId,
}: {
  phcs: Phc[]; onSelect: (p: Phc) => void; layer: string; selectedId?: number;
}) {
  const host       = useRef<HTMLDivElement>(null);
  const mapRef     = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Initialise map once
  useEffect(() => {
    if (!host.current || mapRef.current) return;
    const map = L.map(host.current, { zoomControl: true, attributionControl: true, preferCanvas: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current     = map;
    markersRef.current = L.layerGroup().addTo(map);
    return () => { map.remove(); mapRef.current = null; markersRef.current = null; };
  }, []);

  // Re-draw markers on data/layer/selection change
  useEffect(() => {
    const map   = mapRef.current;
    const group = markersRef.current;
    if (!map || !group) return;
    group.clearLayers();

    if (!phcs.length) { map.setView([20, 30], 2); return; }

    phcs.forEach(p => {
      const color  = colorFor(p, layer);
      const marker = L.marker([p.lat, p.lng], {
        icon:     makeIcon(p, layer, selectedId === p.id),
        title:    `${p.name} · ${p.status}`,
        keyboard: true,
        // verified locations rendered on top of simulated ones
        zIndexOffset: p.locationSource === 'verified' ? 200 : p.status === 'CRITICAL' ? 100 : 0,
      });

      marker.bindPopup(makePopup(p, color), {
        className: 'phc-popup',
        closeButton: true,
        maxWidth: 260,
        minWidth: 220,
      });

      marker.on('click', () => onSelect(p));
      marker.on('popupopen', () => {
        const btn = document.querySelector<HTMLElement>(`.popup-link[data-phc="${p.id}"]`);
        btn?.addEventListener('click', () => onSelect(p), { once: true });
      });

      marker.addTo(group);
    });

    if (phcs.length === 1) {
      map.setView([phcs[0].lat, phcs[0].lng], 9, { animate: true });
    } else {
      const bounds = L.latLngBounds(phcs.map(p => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 5, animate: true });
    }
  }, [phcs, layer, selectedId, onSelect]);

  return (
    <div
      ref={host}
      className="map"
      aria-label="Interactive geographic map of BRICS primary health centres"
    />
  );
}
