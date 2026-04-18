import { MODE_EXPLAINERS } from '../data/cities.js';

export default function ExplainerStrip({ modeId, isMobile }) {
  const ex = MODE_EXPLAINERS[modeId];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10,
      overflow: 'hidden',
      background: '#0D1117',
    }}>
      <Panel label="WHAT IS ECCENTRICITY?" title="The metric">
        How far the city hall sits from the centre, as a fraction of city size.
        0 = exactly central; 0.5 = halfway to the edge; 1.0 = at the boundary.
      </Panel>
      <Panel label="FORMULA" title="Distance ÷ radius" leftBorder={!isMobile} topBorder={isMobile}>
        Eccentricity = straight-line distance between the two points, divided by
        the equivalent radius of the administrative boundary (radius of a circle
        with the same area).
      </Panel>
      <Panel label="CURRENT MEASURE" title={ex.title} leftBorder={!isMobile} topBorder={isMobile} active>
        {ex.body}
      </Panel>
    </div>
  );
}

function Panel({ label, title, children, leftBorder, topBorder, active }) {
  return (
    <div style={{
      padding: '14px 18px',
      borderLeft: leftBorder ? '1px solid rgba(255,255,255,0.06)' : undefined,
      borderTop: topBorder ? '1px solid rgba(255,255,255,0.06)' : undefined,
      background: active ? 'rgba(255,255,255,0.025)' : undefined,
    }}>
      <div style={{ fontSize: 10, letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 5, fontFamily: 'DM Mono, monospace' }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', marginBottom: 7 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}
