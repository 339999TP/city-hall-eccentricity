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

  const containerRef = useRef(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0A0E1A' }}>
      {/* Header */}
      <div style={{
        padding: '18px 28px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 26,
          fontWeight: 800,
          color: '#F8FAFC',
          letterSpacing: '-0.02em',
          marginBottom: 2,
        }}>
          City Hall Eccentricity
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280' }}>
          How far does city hall sit from the centre of its city?
        </p>
      </div>

      {/* Explainer strip */}
      <div style={{ padding: '14px 28px', flexShrink: 0 }}>
        <ExplainerStrip modeId={MODES[modeIdx].id} />
      </div>

      {/* Mode tabs */}
      <div style={{
        padding: '0 28px 14px',
        display: 'flex',
        gap: 6,
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        {MODES.map((mode, idx) => {
          const active = idx === modeIdx;
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(idx)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: active ? `1px solid ${mode.lineColor}55` : '1px solid rgba(255,255,255,0.08)',
                background: active ? `${mode.lineColor}18` : 'transparent',
                color: active ? '#F8FAFC' : '#6B7280',
                fontSize: 13,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {mode.label}
              {mode.capitalsOnly && (
                <span style={{ fontSize: 10, marginLeft: 5, color: '#6B7280' }}>caps</span>
              )}
            </button>
          );
        })}
        <div style={{ fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', marginLeft: 8 }}>
          {MODES[modeIdx].desc}
        </div>
      </div>

      {/* Main content: chart + divider + map */}
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

      {/* Footer */}
      <div style={{
        padding: '8px 28px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: 11,
        color: '#374151',
        fontFamily: 'DM Mono, monospace',
        flexShrink: 0,
      }}>
        Eccentricity = haversine distance ÷ equivalent radius (√(area/π)). All coordinates from OpenStreetMap / Wikidata. Administrative areas from official national statistics.
      </div>
    </div>
  );
}
