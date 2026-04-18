import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MODES, getEccentricity } from '../data/cities.js';

export default function MapView({ city, modeIdx }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef([]);

  // Initialise map once
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [51.5, -0.1],
      zoom: 10,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors © <a href="https://carto.com">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
  }, []);

  // Update layers when city or mode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous layers
    layersRef.current.forEach(l => map.removeLayer(l));
    layersRef.current = [];

    if (!city) return;

    const mode = MODES[modeIdx];
    const A = mode.getA(city);
    const B = mode.getB(city);
    if (!A || !B) return;

    const result = getEccentricity(city, mode);
    if (!result) return;
    const { ecc, dist } = result;

    // Hollow ring marker for A
    const markerA = L.marker([A.lat, A.lon], {
      icon: L.divIcon({
        html: `<div style="width:22px;height:22px;border-radius:50%;border:2.5px solid ${mode.aColor};background:${mode.aColor}22;box-shadow:0 0 10px ${mode.aColor}55;"></div>`,
        className: '',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    }).addTo(map);
    markerA.bindPopup(
      `<b style="color:${mode.aColor}">${mode.aLabel}</b><br/><span style="color:#94a3b8">${A.name}</span>`
    );
    layersRef.current.push(markerA);

    // Solid dot marker for B
    const markerB = L.marker([B.lat, B.lon], {
      icon: L.divIcon({
        html: `<div style="width:22px;height:22px;border-radius:50%;background:${mode.bColor};box-shadow:0 0 12px ${mode.bColor}77;border:2px solid rgba(255,255,255,0.7);"></div>`,
        className: '',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    }).addTo(map);
    markerB.bindPopup(
      `<b style="color:${mode.bColor}">${mode.bLabel}</b><br/><span style="color:#94a3b8">${B.name}</span><br/><span style="font-family:monospace;color:#64748b">${dist.toFixed(2)} km · ecc ${ecc.toFixed(3)}</span>`
    );
    layersRef.current.push(markerB);

    // Dashed line
    const line = L.polyline(
      [[A.lat, A.lon], [B.lat, B.lon]],
      { color: mode.lineColor, weight: 2, dashArray: '6 5', opacity: 0.8 }
    ).addTo(map);
    layersRef.current.push(line);

    // Distance label at midpoint
    const midLat = (A.lat + B.lat) / 2;
    const midLon = (A.lon + B.lon) / 2;
    const midMarker = L.marker([midLat, midLon], {
      icon: L.divIcon({
        html: `<div style="background:rgba(10,14,26,0.85);border:1px solid rgba(255,255,255,0.12);border-radius:5px;padding:3px 7px;font-size:11px;font-family:'DM Mono',monospace;color:#e2e8f0;white-space:nowrap;">${dist.toFixed(1)} km</div>`,
        className: '',
        iconAnchor: [30, 10],
      }),
    }).addTo(map);
    layersRef.current.push(midMarker);

    // Fit bounds
    map.fitBounds([[A.lat, A.lon], [B.lat, B.lon]], { padding: [70, 70], maxZoom: 15 });

    // Invalidate size after a tick (handles panel resize)
    setTimeout(() => map.invalidateSize(), 50);
  }, [city, modeIdx]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend overlay */}
      {city && (
        <div style={{
          position: 'absolute',
          bottom: 24,
          right: 16,
          background: 'rgba(10,14,26,0.88)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 12,
          lineHeight: 1.8,
          zIndex: 800,
          pointerEvents: 'none',
        }}>
          <LegendRow color={MODES[modeIdx].aColor} label={MODES[modeIdx].aLabel} hollow />
          <LegendRow color={MODES[modeIdx].bColor} label={MODES[modeIdx].bLabel} />
          <LegendRow color={MODES[modeIdx].lineColor} label="Distance line" line />
        </div>
      )}

      {/* Empty state */}
      {!city && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 800,
        }}>
          <div style={{
            background: 'rgba(10,14,26,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '16px 24px',
            textAlign: 'center',
            color: '#6B7280',
            fontSize: 13,
          }}>
            Click a city in the chart to see it on the map
          </div>
        </div>
      )}
    </div>
  );
}

function LegendRow({ color, label, hollow, line }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {line ? (
        <div style={{ width: 16, height: 2, borderTop: `2px dashed ${color}`, opacity: 0.8 }} />
      ) : (
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          background: hollow ? `${color}22` : color,
          border: hollow ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.5)',
          flexShrink: 0,
        }} />
      )}
      <span style={{ color: '#9CA3AF', fontSize: 11 }}>{label}</span>
    </div>
  );
}
