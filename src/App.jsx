import { useState, useRef, useCallback, useEffect } from 'react';
import { MODES, CITIES } from './data/cities.js';
import ExplainerStrip from './components/ExplainerStrip.jsx';
import BarChart from './components/BarChart.jsx';
import MapView from './components/MapView.jsx';

const MIN_CHART = 260;
const MIN_MAP = 280;

export default function App() {
  const [modeIdx, setModeIdx] = useState(1); // Pop-Weighted default
  const [selectedCity, setSelectedCity] = useState(null);
  const [chartWidth, setChartWidth] = useState(340);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const containerRef = useRef(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const onMouseDown = useCallback(e => {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = chartWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [chartWidth]);

  useEffect(() => {
    const onMove = e => {
      if (!dragging.current) return;
      const dx = e.clientX - startX.current;
      const totalW = containerRef.current?.offsetWidth || 800;
      const newW = Math.max(MIN_CHART, Math.min(startW.current + dx, totalW - MIN_MAP - 8));
      setChartWidth(newW);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // When mode changes to capitals-only, clear selection if city isn't a capital
  const handleModeChange = idx => {
    setModeIdx(idx);
    if (MODES[idx].capitalsOnly && selectedCity && !selectedCity.isCapital) {
      setSelectedCity(null);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0A0E1A',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: isMobile ? '14px 16px 10px' : '18px 28px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: isMobile ? 22 : 26,
          fontWeight: 800,
          color: '#F8FAFC',
          letterSpacing: '-0.02em',
          marginBottom: 2,
        }}>
          City Hall Eccentricity
        </h1>
        <p style={{ fontSize: 13, color: '#94A3B8' }}>
          How far does city hall sit from the centre of its city?
        </p>
      </div>

      {/* Mode tabs */}
      <div style={{
        padding: isMobile ? '12px 16px' : '14px 28px 14px',
        display: 'flex',
        gap: isMobile ? 8 : 6,
        flexShrink: 0,
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
        borderBottom: isMobile ? '1px solid rgba(255,255,255,0.06)' : 'none',
        scrollbarWidth: 'none',
      }}>
        {MODES.map((mode, idx) => {
          const active = idx === modeIdx;
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(idx)}
              style={{
                padding: isMobile ? '10px 18px' : '6px 14px',
                borderRadius: 8,
                border: active
                  ? `2px solid ${mode.lineColor}99`
                  : `2px solid rgba(255,255,255,0.1)`,
                background: active ? `${mode.lineColor}28` : 'rgba(255,255,255,0.03)',
                color: active ? '#F8FAFC' : '#9CA3AF',
                fontSize: isMobile ? 15 : 13,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                boxShadow: active && isMobile ? `0 0 12px ${mode.lineColor}44` : 'none',
              }}
            >
              {mode.label}
              {mode.capitalsOnly && (
                <span style={{ fontSize: isMobile ? 11 : 10, marginLeft: 5, color: active ? '#CBD5E1' : '#94A3B8' }}>caps</span>
              )}
            </button>
          );
        })}
        {!isMobile && (
          <div style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', marginLeft: 8 }}>
            {MODES[modeIdx].desc}
          </div>
        )}
      </div>

      {/* Mode description on mobile */}
      {isMobile && (
        <div style={{
          padding: '8px 16px 10px',
          fontSize: 12,
          color: '#94A3B8',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}>
          {MODES[modeIdx].desc}
        </div>
      )}

      {isMobile ? (
        /* Mobile: map pinned at top, chart+definitions scroll below */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Map — always visible */}
          <div style={{ height: 220, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0A0E1A' }}>
            <MapView city={selectedCity} modeIdx={modeIdx} isMobile />
          </div>

          {/* Scrollable section: full chart list + definitions */}
          <div style={{ flex: 1, overflowY: 'auto', background: '#0D1117', minHeight: 0 }}>
            <BarChart
              modeIdx={modeIdx}
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
              mobile
            />
            <div style={{ padding: '16px 16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <ExplainerStrip modeId={MODES[modeIdx].id} isMobile />
            </div>
          </div>
        </div>
      ) : (
        /* Desktop: explainer strip + side-by-side chart/map */
        <>
          <div style={{ padding: '14px 28px', flexShrink: 0 }}>
            <ExplainerStrip modeId={MODES[modeIdx].id} />
          </div>

          <div
            ref={containerRef}
            style={{
              flex: 1,
              display: 'flex',
              overflow: 'hidden',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              minHeight: 0,
            }}
          >
            {/* Bar chart panel */}
            <div style={{
              width: chartWidth,
              flexShrink: 0,
              borderRight: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: '#0D1117',
            }}>
              <BarChart
                modeIdx={modeIdx}
                selectedCity={selectedCity}
                onSelectCity={setSelectedCity}
              />
            </div>

            {/* Draggable divider */}
            <div
              onMouseDown={onMouseDown}
              style={{
                width: 6,
                flexShrink: 0,
                cursor: 'col-resize',
                background: 'transparent',
                position: 'relative',
                zIndex: 10,
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 2,
                height: 40,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.12)',
              }} />
            </div>

            {/* Map panel */}
            <div style={{ flex: 1, overflow: 'hidden', background: '#0A0E1A' }}>
              <MapView city={selectedCity} modeIdx={modeIdx} />
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{
        padding: isMobile ? '10px 16px' : '8px 28px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: 11,
        color: '#6B7280',
        fontFamily: 'DM Mono, monospace',
        flexShrink: 0,
      }}>
        Eccentricity = haversine distance ÷ equivalent radius (√(area/π)). All coordinates from OpenStreetMap / Wikidata. Administrative areas from official national statistics.
      </div>
    </div>
  );
}
