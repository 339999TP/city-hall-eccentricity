import { CITIES, MODES, CC, getEccentricity } from '../data/cities.js';

const DATA_SOURCES = `Pop-weighted centroids — ONS Census 2021 (UK); INSEE RP 2021 (France); Zensus 2022 (Germany); Statistik Austria 2023; Statistics Korea 2020; Tokyo Metropolitan Statistics 2020; US Census 2020; Statistics Canada 2021; GUS 2021 (Poland); ISTAT 2021 (Italy); INE Padrón 2021 (Spain); Statbel 2022 (Belgium); Oslo Statistikk 2023; ČSÚ 2021 (Czech Republic); Rosstat 2021 (Russia)

Geometric centroids — Natural Earth 1:10m Admin-1 boundary polygons (naturalearthdata.com)

Administrative areas — Official national statistics offices

Building coordinates — OpenStreetMap / Wikidata

Map tiles — © OpenStreetMap contributors, © CARTO`;

export default function BarChart({ modeIdx, selectedCity, onSelectCity }) {
  const mode = MODES[modeIdx];

  const rows = CITIES
    .map(city => {
      const result = getEccentricity(city, mode);
      if (!result) return null;
      return { city, ...result };
    })
    .filter(Boolean)
    .sort((a, b) => b.ecc - a.ecc);

  const maxEcc = rows[0]?.ecc || 1;

  const countries = [...new Set(CITIES.map(c => c.country))].sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        background: '#0D1117',
        padding: '10px 16px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em', marginBottom: 4 }}>
          eccentricity →
        </div>
        <div style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.3 }}>
          {mode.desc}
        </div>
      </div>

      {/* Bar rows — natural height, no internal scroll */}
      <div style={{ padding: '6px 0' }}>
        {rows.map(({ city, ecc, dist }) => {
          const isSelected = city === selectedCity;
          const barColor = isSelected ? mode.bColor : (CC[city.country] || '#94A3B8');
          const barWidth = (ecc / maxEcc) * 100;
          const barH = isSelected ? 18 : 13;

          return (
            <div
              key={city.name}
              onClick={() => onSelectCity(city)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 16px',
                cursor: 'pointer',
                opacity: isSelected ? 1 : 0.82,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = isSelected ? '1' : '0.82'}
            >
              {/* Label */}
              <div style={{
                width: 120,
                textAlign: 'right',
                paddingRight: 12,
                fontSize: 12,
                color: isSelected ? '#F8FAFC' : '#CBD5E1',
                fontWeight: isSelected ? 600 : 400,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {city.name}
                {city.isCapital && !mode.capitalsOnly && (
                  <sup style={{ fontSize: 8, color: '#94A3B8', marginLeft: 2 }}>★</sup>
                )}
              </div>

              {/* Bar + value */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: `${barWidth}%`,
                  height: barH,
                  background: barColor,
                  borderRadius: 2,
                  transition: 'width 0.3s ease, height 0.15s ease',
                  flexShrink: 0,
                  minWidth: 2,
                }} />
                <div style={{
                  fontSize: 11,
                  fontFamily: 'DM Mono, monospace',
                  color: isSelected ? '#F8FAFC' : '#94A3B8',
                  whiteSpace: 'nowrap',
                }}>
                  {ecc.toFixed(3)}
                  {isSelected && (
                    <span style={{ color: '#CBD5E1', marginLeft: 6 }}>
                      · {dist.toFixed(1)} km
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Country legend */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px 0',
      }}>
        <div style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 8, fontFamily: 'DM Mono, monospace' }}>
          COUNTRIES
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
          {countries.map(c => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: CC[c] || '#94A3B8', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div style={{ padding: '12px 16px 16px', marginTop: 4 }}>
        <div style={{ fontSize: 11, color: '#6B7280', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'DM Mono, monospace' }}>
          DATA SOURCES
        </div>
        <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.6, fontFamily: 'DM Mono, monospace', whiteSpace: 'pre-line' }}>
          {DATA_SOURCES}
        </div>
      </div>
    </div>
  );
}
