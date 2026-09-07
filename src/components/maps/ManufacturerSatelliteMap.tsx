import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Manufacturer } from '../../types/compliance';

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

type TileMode = 'satellite' | 'street';
type RegionFilter = 'bengaluru' | 'south' | 'all';

interface Props {
  manufacturers: Manufacturer[];
  selectedId: string | null;
  onSelect: (mfg: Manufacturer) => void;
}

// Risk-tier color config
const RISK_CONFIG = {
  Critical: { color: '#dc2626', bg: '#fee2e2', pulse: true },
  High:     { color: '#d97706', bg: '#fef3c7', pulse: true },
  Moderate: { color: '#ca8a04', bg: '#fefce8', pulse: false },
  Low:      { color: '#16a34a', bg: '#dcfce7', pulse: false },
} as const;

// Region bounding boxes
const REGIONS: Record<RegionFilter, L.LatLngBoundsLiteral | null> = {
  bengaluru: [[12.75, 77.35], [13.18, 77.82]],
  south:     [[10.0, 74.0],  [15.5, 80.5]],
  all:       null,
};

const REGION_LABELS: Record<RegionFilter, string> = {
  bengaluru: 'Bengaluru City (BBMP)',
  south: 'South Zone',
  all: 'All India',
};

function createRiskMarker(riskTier: keyof typeof RISK_CONFIG, isSelected: boolean): L.DivIcon {
  const cfg = RISK_CONFIG[riskTier];
  const size = isSelected ? 22 : 16;
  const ring = isSelected ? `box-shadow:0 0 0 3px white,0 0 0 5px ${cfg.color};` : '';
  const pulse = cfg.pulse
    ? `<span style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${cfg.color};opacity:0.5;animation:map-ping 1.5s ease-out infinite;"></span>`
    : '';
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      ${pulse}
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:${cfg.color};border:2.5px solid white;${ring}"></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

export const ManufacturerSatelliteMap: React.FC<Props> = ({ manufacturers, selectedId, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [tileMode, setTileMode] = useState<TileMode>('satellite');
  const [region, setRegion] = useState<RegionFilter>('bengaluru');

  // Tile layer URLs
  const TILES = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attr: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  };

  // Inject pulse animation CSS once
  useEffect(() => {
    if (document.getElementById('map-ping-style')) return;
    const style = document.createElement('style');
    style.id = 'map-ping-style';
    style.textContent = `@keyframes map-ping { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }`;
    document.head.appendChild(style);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [12.9716, 77.5946], // Bengaluru center
      zoom: 11,
      zoomControl: true,
    });

    tileLayerRef.current = L.tileLayer(TILES.satellite.url, {
      attribution: TILES.satellite.attr,
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Switch tile layer when tileMode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }
    const t = TILES[tileMode];
    tileLayerRef.current = L.tileLayer(t.url, { attribution: t.attr, maxZoom: 19 }).addTo(map);
  }, [tileMode]);

  // Apply region filter
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = REGIONS[region];
    if (bounds) {
      map.fitBounds(bounds, { animate: true, padding: [24, 24] });
    } else {
      // All India
      map.setView([22.5, 80.0], 5, { animate: true });
    }
  }, [region]);

  // Place/update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    manufacturers.forEach((mfg) => {
      const { lat, lng } = mfg.coordinates;
      const isSelected = mfg.id === selectedId;
      const icon = createRiskMarker(mfg.riskTier, isSelected);

      const marker = L.marker([lat, lng], { icon, zIndexOffset: isSelected ? 1000 : 0 });

      // Popup content
      const cfg = RISK_CONFIG[mfg.riskTier];
      const popupHtml = `
        <div style="font-family:'Inter',sans-serif;min-width:220px;max-width:260px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="background:${cfg.color};color:white;font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;letter-spacing:0.05em;">
              ${mfg.riskTier.toUpperCase()} RISK · ${mfg.riskScore}/100
            </span>
            ${mfg.repeatOffenderFlag ? '<span style="background:#fef2f2;color:#b91c1c;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;border:1px solid #fecaca;">Repeat Offender</span>' : ''}
          </div>
          <div style="font-weight:700;font-size:12px;color:#0f172a;margin-bottom:2px;line-height:1.3;">${mfg.name}</div>
          <div style="font-size:10px;color:#64748b;margin-bottom:6px;font-family:monospace;">${mfg.facilityType}</div>
          <div style="font-size:10px;color:#374151;margin-bottom:8px;">${mfg.zone}</div>
          <div style="display:flex;gap:12px;font-size:10px;color:#374151;margin-bottom:10px;">
            <div><span style="color:#94a3b8;">Active Violations</span><br/><strong style="color:#dc2626;">${mfg.activeViolations}</strong></div>
            <div><span style="color:#94a3b8;">SCN Notices</span><br/><strong style="color:#0f172a;">${mfg.noticesIssued}</strong></div>
            <div><span style="color:#94a3b8;">SKUs Scanned</span><br/><strong style="color:#0f172a;">${mfg.totalProductsScanned}</strong></div>
          </div>
          <button
            id="dossier-btn-${mfg.id}"
            style="width:100%;padding:6px 0;background:#1e40af;color:white;font-size:11px;font-weight:600;border:none;border-radius:6px;cursor:pointer;"
            onclick="document.dispatchEvent(new CustomEvent('map-open-dossier', {detail:'${mfg.id}'}))"
          >
            View Full Dossier & Violations →
          </button>
        </div>`;

      marker.bindPopup(L.popup({ maxWidth: 280, className: 'mfg-map-popup' }).setContent(popupHtml));
      marker.on('click', () => onSelect(mfg));
      marker.addTo(map);
      markersRef.current.set(mfg.id, marker);
    });
  }, [manufacturers, selectedId]);

  // Pan to selected marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const mfg = manufacturers.find((m) => m.id === selectedId);
    if (!mfg) return;
    map.setView([mfg.coordinates.lat, mfg.coordinates.lng], Math.max(map.getZoom(), 14), { animate: true });
    const marker = markersRef.current.get(selectedId);
    if (marker) marker.openPopup();
  }, [selectedId]);

  // Listen for custom event from popup button
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const mfg = manufacturers.find((m) => m.id === id);
      if (mfg) onSelect(mfg);
    };
    document.addEventListener('map-open-dossier', handler);
    return () => document.removeEventListener('map-open-dossier', handler);
  }, [manufacturers, onSelect]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Controls overlay */}
      <div className="absolute top-3 left-3 z-[500] flex flex-col gap-2">
        {/* Tile toggle */}
        <div className="flex rounded-lg overflow-hidden border border-slate-300 shadow-sm text-[10px] font-semibold">
          <button
            onClick={() => setTileMode('satellite')}
            className={`px-3 py-1.5 transition-colors ${tileMode === 'satellite' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            🛰 Satellite
          </button>
          <button
            onClick={() => setTileMode('street')}
            className={`px-3 py-1.5 transition-colors ${tileMode === 'street' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            🗺 Street
          </button>
        </div>

        {/* Region filters */}
        <div className="flex flex-col gap-1">
          {(Object.keys(REGION_LABELS) as RegionFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border shadow-sm transition-colors text-left ${
                region === r
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {REGION_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Risk legend */}
      <div className="absolute bottom-3 right-3 z-[500] bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow px-3 py-2 text-[10px]">
        <div className="font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Risk Tier</div>
        {(Object.keys(RISK_CONFIG) as (keyof typeof RISK_CONFIG)[]).map((tier) => (
          <div key={tier} className="flex items-center gap-2 mb-0.5">
            <span
              className="inline-block w-3 h-3 rounded-full border-2 border-white shadow-sm"
              style={{ background: RISK_CONFIG[tier].color }}
            />
            <span className="text-slate-600 font-medium">{tier}</span>
          </div>
        ))}
      </div>

      {/* Map container */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
