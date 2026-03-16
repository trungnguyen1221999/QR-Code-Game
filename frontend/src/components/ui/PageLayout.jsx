/**
 * PageLayout – forest/mountain themed background, phone-width centered column.
 */
import BackButton from './BackButton';

export default function PageLayout({ children, back, className = '' }) {
  return (
    <div
      className="min-h-screen flex justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #C8E6F5 0%, #D9EFC7 30%, #EEF7E4 65%, #FFF8F0 100%)',
      }}
    >
      {/* ── Sky & clouds ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

          {/* Clouds */}
          <ellipse cx="60"  cy="60"  rx="45" ry="18" fill="white" fillOpacity="0.55" />
          <ellipse cx="90"  cy="50"  rx="30" ry="14" fill="white" fillOpacity="0.50" />
          <ellipse cx="300" cy="80"  rx="50" ry="20" fill="white" fillOpacity="0.50" />
          <ellipse cx="330" cy="68"  rx="32" ry="14" fill="white" fillOpacity="0.45" />
          <ellipse cx="170" cy="40"  rx="35" ry="14" fill="white" fillOpacity="0.38" />

          {/* Far mountains */}
          <polygon points="0,420 80,260 160,420"   fill="#8DB87A" fillOpacity="0.45" />
          <polygon points="60,420 160,230 260,420"  fill="#7AAD64" fillOpacity="0.50" />
          <polygon points="140,420 260,200 380,420" fill="#6A9E55" fillOpacity="0.55" />
          <polygon points="260,420 360,240 400,420" fill="#7AAD64" fillOpacity="0.45" />
          <polygon points="0,420 50,300 120,420"    fill="#5A9245" fillOpacity="0.40" />

          {/* Mountain snow tips */}
          <polygon points="160,230 175,260 145,260" fill="white" fillOpacity="0.70" />
          <polygon points="260,200 278,238 242,238" fill="white" fillOpacity="0.65" />

          {/* Mid-ground hills */}
          <ellipse cx="0"   cy="520" rx="120" ry="60" fill="#4E8C38" fillOpacity="0.60" />
          <ellipse cx="200" cy="510" rx="160" ry="70" fill="#5A9E42" fillOpacity="0.55" />
          <ellipse cx="400" cy="525" rx="130" ry="65" fill="#4A8832" fillOpacity="0.60" />

          {/* Foreground forest trees — bottom */}
          {/* Tree helper: trunk + triangle crown */}
          {[
            { x: 10,  h: 90, cw: 22, col: '#2D6A1F' },
            { x: 40,  h: 110, cw: 26, col: '#3A7A28' },
            { x: 70,  h: 80, cw: 20, col: '#2D6A1F' },
            { x: 100, h: 100, cw: 24, col: '#4A8C32' },
            { x: 130, h: 85, cw: 21, col: '#3A7A28' },
            { x: 160, h: 115, cw: 28, col: '#2D6A1F' },
            { x: 195, h: 75, cw: 19, col: '#4A8C32' },
            { x: 225, h: 105, cw: 25, col: '#3A7A28' },
            { x: 260, h: 90, cw: 22, col: '#2D6A1F' },
            { x: 295, h: 110, cw: 27, col: '#4A8C32' },
            { x: 330, h: 80, cw: 20, col: '#3A7A28' },
            { x: 360, h: 100, cw: 24, col: '#2D6A1F' },
            { x: 390, h: 88, cw: 22, col: '#4A8C32' },
          ].map(({ x, h, cw, col }, i) => (
            <g key={i}>
              {/* Trunk */}
              <rect x={x - 2} y={800 - h * 0.35} width="4" height={h * 0.35} fill="#5C3A1E" fillOpacity="0.8" />
              {/* Crown layers */}
              <polygon
                points={`${x},${800 - h} ${x + cw},${800 - h * 0.6} ${x - cw},${800 - h * 0.6}`}
                fill={col} fillOpacity="0.90"
              />
              <polygon
                points={`${x},${800 - h * 0.75} ${x + cw * 1.2},${800 - h * 0.4} ${x - cw * 1.2},${800 - h * 0.4}`}
                fill={col} fillOpacity="0.80"
              />
            </g>
          ))}

          {/* Ground strip */}
          <rect x="0" y="770" width="400" height="30" fill="#3A6B24" fillOpacity="0.50" />
        </svg>
      </div>

      {/* ── Content ── */}
      <div className={`w-full max-w-sm flex flex-col px-5 pb-12 relative ${className}`} style={{ zIndex: 1 }}>
        {back !== undefined && (
          <div className="pt-5 pb-2">
            <BackButton to={back} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
