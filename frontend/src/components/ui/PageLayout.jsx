import BackButton from './BackButton';

/* ── SVG Icons ───────────────────────────────────────────── */
function ButterflyIcon({ size = 48, color1 = '#A855F7', color2 = '#EC4899', id }) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 100 90" fill="none">
      <g className={`bf-lwing-${id}`} style={{ transformBox: 'fill-box', transformOrigin: 'right center' }}>
        <path d="M48 42 C44 32, 28 10, 8 8 C-4 7, 2 28, 14 36 C26 44, 40 42, 48 42Z" fill={color1} />
        <path d="M46 40 C42 31, 28 13, 12 12 C4 12, 8 28, 18 35 C30 42, 42 40, 46 40Z" fill="white" opacity="0.18" />
        <circle cx="20" cy="22" r="4" fill="white" opacity="0.22" />
        <circle cx="32" cy="32" r="2.5" fill="white" opacity="0.18" />
        <path d="M47 46 C38 52, 18 62, 16 74 C14 82, 28 84, 38 76 C48 68, 48 54, 47 46Z" fill={color2} />
        <circle cx="26" cy="72" r="3.5" fill="white" opacity="0.22" />
      </g>
      <g className={`bf-rwing-${id}`} style={{ transformBox: 'fill-box', transformOrigin: 'left center' }}>
        <path d="M52 42 C56 32, 72 10, 92 8 C104 7, 98 28, 86 36 C74 44, 60 42, 52 42Z" fill={color1} />
        <path d="M54 40 C58 31, 72 13, 88 12 C96 12, 92 28, 82 35 C70 42, 58 40, 54 40Z" fill="white" opacity="0.18" />
        <circle cx="80" cy="22" r="4" fill="white" opacity="0.22" />
        <circle cx="68" cy="32" r="2.5" fill="white" opacity="0.18" />
        <path d="M53 46 C62 52, 82 62, 84 74 C86 82, 72 84, 62 76 C52 68, 52 54, 53 46Z" fill={color2} />
        <circle cx="74" cy="72" r="3.5" fill="white" opacity="0.22" />
      </g>
      <ellipse cx="50" cy="50" rx="2.5" ry="16" fill="#1a0030" />
      <ellipse cx="50" cy="40" rx="3.5" ry="5" fill="#2d0050" />
      <circle cx="50" cy="33" r="3.5" fill="#1a0030" />
      <path d="M48.5 31 Q42 20 36 14" stroke="#1a0030" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="35.5" cy="13.5" r="2.8" fill={color1} />
      <path d="M51.5 31 Q58 20 64 14" stroke="#1a0030" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="64.5" cy="13.5" r="2.8" fill={color1} />
    </svg>
  );
}

function BeeIcon({ size = 40 }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 36 40" fill="none">
      <g className="bee-lwing" style={{ transformBox: 'fill-box', transformOrigin: 'right center' }}>
        <ellipse cx="9" cy="14" rx="9" ry="5.5" fill="white" opacity="0.82" transform="rotate(-30 9 14)" />
        <ellipse cx="7" cy="12" rx="4" ry="2.5" fill="#BAE6FD" opacity="0.5" transform="rotate(-30 7 12)" />
      </g>
      <g className="bee-rwing" style={{ transformBox: 'fill-box', transformOrigin: 'left center' }}>
        <ellipse cx="27" cy="14" rx="9" ry="5.5" fill="white" opacity="0.82" transform="rotate(30 27 14)" />
        <ellipse cx="29" cy="12" rx="4" ry="2.5" fill="#BAE6FD" opacity="0.5" transform="rotate(30 29 12)" />
      </g>
      <circle cx="18" cy="10" r="6.5" fill="#FCD34D" />
      <circle cx="15" cy="9" r="1.8" fill="#1C1917" />
      <circle cx="21" cy="9" r="1.8" fill="#1C1917" />
      <circle cx="15.6" cy="8.4" r="0.7" fill="white" />
      <circle cx="21.6" cy="8.4" r="0.7" fill="white" />
      <path d="M15 12 Q18 14.5 21 12" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <ellipse cx="18" cy="26" rx="9" ry="12" fill="#FCD34D" />
      <path d="M9.5 22 Q18 24 26.5 22 Q26.5 26 18 26 Q9.5 26 9.5 22Z" fill="#1C1917" opacity="0.8" />
      <path d="M9.2 28 Q18 30.5 26.8 28 Q26.5 32 18 32 Q9.5 32 9.2 28Z" fill="#1C1917" opacity="0.75" />
      <path d="M16 37.5 Q18 40 20 37.5 Q18 35 16 37.5Z" fill="#92400E" />
    </svg>
  );
}

function LeafIcon({ size = 16, color = '#4ade80' }) {
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 20 27" fill="none">
      <path d="M10 25 C10 25, 1 18, 1 10 C1 3, 5 0, 10 1 C15 0, 19 3, 19 10 C19 18, 10 25, 10 25Z"
        fill={color} opacity="0.88" />
      <path d="M10 25 L10 4" stroke="rgba(0,80,0,0.45)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 11 Q6 8 3 6" stroke="rgba(0,80,0,0.28)" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M10 16 Q14 13 17 11" stroke="rgba(0,80,0,0.28)" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

/* ── Creatures — bottom + center ─────────────────────────── */
const CREATURES = [
  // bottom
  { id: 'bf1', type: 'butterfly', color1: '#A855F7', color2: '#EC4899', size: 58,
    top: '62%', left: '5%',  dur: 9,  delay: -3,   driftX: 50,  driftY: 30, flapDur: 0.55 },
  { id: 'bf2', type: 'butterfly', color1: '#3B82F6', color2: '#06B6D4', size: 50,
    top: '72%', left: '65%', dur: 11, delay: -7,   driftX: -42, driftY: 28, flapDur: 0.48 },
  { id: 'bf3', type: 'butterfly', color1: '#F59E0B', color2: '#EF4444', size: 55,
    top: '58%', left: '55%', dur: 10, delay: -5,   driftX: 40,  driftY: 35, flapDur: 0.52 },
  { id: 'bf4', type: 'butterfly', color1: '#10B981', color2: '#34D399', size: 45,
    top: '80%', left: '70%', dur: 12, delay: -9,   driftX: -35, driftY: 25, flapDur: 0.60 },
  { id: 'bf5', type: 'butterfly', color1: '#EC4899', color2: '#F97316', size: 63,
    top: '68%', left: '18%', dur: 8,  delay: -2,   driftX: 38,  driftY: 32, flapDur: 0.45 },
  { id: 'be2', type: 'bee', size: 43,
    top: '75%', left: '82%', dur: 6,  delay: -4,   driftX: -32, driftY: 28 },
  { id: 'be3', type: 'bee', size: 48,
    top: '85%', left: '8%',  dur: 5,  delay: -1.5, driftX: 28,  driftY: 22 },
  // center
  { id: 'bf6', type: 'butterfly', color1: '#8B5CF6', color2: '#F472B6', size: 44,
    top: '35%', left: '3%',  dur: 13, delay: -6,   driftX: 45,  driftY: 28, flapDur: 0.50 },
  { id: 'bf7', type: 'butterfly', color1: '#06B6D4', color2: '#10B981', size: 38,
    top: '42%', left: '78%', dur: 10, delay: -8,   driftX: -38, driftY: 32, flapDur: 0.58 },
  { id: 'bf8', type: 'butterfly', color1: '#F97316', color2: '#FBBF24', size: 48,
    top: '50%', left: '30%', dur: 11, delay: -3,   driftX: -44, driftY: 30, flapDur: 0.46 },
  { id: 'be4', type: 'bee', size: 36,
    top: '38%', left: '60%', dur: 7,  delay: -5,   driftX: 30,  driftY: 24 },
  { id: 'be5', type: 'bee', size: 40,
    top: '48%', left: '88%', dur: 6,  delay: -2,   driftX: -28, driftY: 20 },
];

/* ── Falling leaves — diagonal (wx = total horizontal drift) ─ */
const LEAVES = [
  { id: 'lf1', left: '3%',  size: 17, dur: 13, delay: -2,   wx:  200, color: '#4ade80' },
  { id: 'lf2', left: '74%', size: 20, dur: 10, delay: -7,   wx: -180, color: '#86efac' },
  { id: 'lf3', left: '5%',  size: 14, dur: 15, delay: -11,  wx:  220, color: '#22c55e' },
  { id: 'lf4', left: '80%', size: 18, dur: 11, delay: -8,   wx: -195, color: '#4ade80' },
  { id: 'lf5', left: '8%',  size: 13, dur: 14, delay: -4,   wx:  185, color: '#86efac' },
  { id: 'lf6', left: '70%', size: 17, dur: 12, delay: -9.5, wx: -170, color: '#16a34a' },
];

/* ── Clouds (drift right → left) ────────────────────────── */
const CLOUDS = [
  { id: 'ck1', base: 0.05, yRatio: 0.06, r: 50, dur: 27,  delay: -1  },
  { id: 'ck2', base: 0.30, yRatio: 0.11, r: 37, dur: 38,  delay: -11 },
  { id: 'ck3', base: 0.54, yRatio: 0.04, r: 60, dur: 35,  delay: -19 },
  { id: 'ck4', base: 0.74, yRatio: 0.09, r: 44, dur: 24,  delay: -18 },
  { id: 'ck5', base: 0.88, yRatio: 0.14, r: 34, dur: 32,  delay: -28 },
  { id: 'ck6', base: 0.18, yRatio: 0.17, r: 30, dur: 24,  delay: -4  },
];

function CloudIcon({ r = 50 }) {
  return (
    <svg
      width={3.3 * r}
      height={2.38 * r}
      viewBox={`${-1.35 * r} ${-0.88 * r} ${3.3 * r} ${2.38 * r}`}
      fill="rgba(255,255,255,0.93)"
    >
      <circle cx={0}          cy={0.4 * r}  r={r}          />
      <circle cx={0.7 * r}    cy={0}         r={0.78 * r}   />
      <circle cx={-0.6 * r}   cy={0.2 * r}  r={0.65 * r}   />
      <circle cx={1.3 * r}    cy={0.3 * r}  r={0.55 * r}   />
    </svg>
  );
}

/* ── Per-butterfly wing flap keyframes ───────────────────── */
const flapKeyframes = CREATURES
  .filter(c => c.type === 'butterfly')
  .map(c => `
    .bf-lwing-${c.id} { animation: wingFlap ${c.flapDur}s ease-in-out infinite; }
    .bf-rwing-${c.id} { animation: wingFlap ${c.flapDur}s ease-in-out infinite; }
  `).join('');

const KEYFRAMES = `
  @keyframes wingFlap {
    0%, 100% { transform: scaleX(1); }
    50%       { transform: scaleX(0.12); }
  }

  .bee-lwing { animation: beeWingL 0.08s linear infinite alternate; }
  .bee-rwing { animation: beeWingR 0.08s linear infinite alternate; }
  @keyframes beeWingL {
    from { transform: scaleY(1) rotate(-5deg); }
    to   { transform: scaleY(0.5) rotate(-20deg); }
  }
  @keyframes beeWingR {
    from { transform: scaleY(1) rotate(5deg); }
    to   { transform: scaleY(0.5) rotate(20deg); }
  }

  ${flapKeyframes}

  @keyframes butterflyFly {
    0%   { transform: translate(0px, 0px) rotate(0deg); }
    12%  { transform: translate(calc(var(--dx)*0.3), calc(var(--dy)*-0.8)) rotate(6deg); }
    25%  { transform: translate(calc(var(--dx)*0.7), calc(var(--dy)*-0.2)) rotate(-5deg); }
    38%  { transform: translate(calc(var(--dx)*1.0), calc(var(--dy)*-1.0)) rotate(8deg); }
    50%  { transform: translate(calc(var(--dx)*0.8), calc(var(--dy)*-0.5)) rotate(-4deg); }
    62%  { transform: translate(calc(var(--dx)*1.2), calc(var(--dy)*-1.2)) rotate(7deg); }
    75%  { transform: translate(calc(var(--dx)*0.5), calc(var(--dy)*-0.3)) rotate(-6deg); }
    88%  { transform: translate(calc(var(--dx)*0.2), calc(var(--dy)*-0.7)) rotate(4deg); }
    100% { transform: translate(0px, 0px) rotate(0deg); }
  }
  @keyframes beeFly {
    0%   { transform: translate(0px, 0px) rotate(-6deg); }
    15%  { transform: translate(calc(var(--dx)*0.4), calc(var(--dy)*-1.0)) rotate(8deg); }
    30%  { transform: translate(calc(var(--dx)*0.9), calc(var(--dy)*-0.3)) rotate(-10deg); }
    45%  { transform: translate(calc(var(--dx)*1.1), calc(var(--dy)*-1.2)) rotate(7deg); }
    60%  { transform: translate(calc(var(--dx)*0.6), calc(var(--dy)*-0.6)) rotate(-8deg); }
    75%  { transform: translate(calc(var(--dx)*1.0), calc(var(--dy)*-0.9)) rotate(9deg); }
    90%  { transform: translate(calc(var(--dx)*0.2), calc(var(--dy)*-0.2)) rotate(-5deg); }
    100% { transform: translate(0px, 0px) rotate(-6deg); }
  }

  /* Diagonal leaf fall — left-to-right or right-to-left via --wx sign */
  @keyframes leafFall {
    0%   { transform: translate(0px, -70px) rotate(-25deg); opacity: 0; }
    8%   { opacity: 0.82; }
    25%  { transform: translate(calc(var(--wx)*0.22), 20vh) rotate(18deg); }
    45%  { transform: translate(calc(var(--wx)*0.48), 42vh) rotate(60deg); }
    65%  { transform: translate(calc(var(--wx)*0.70), 62vh) rotate(105deg); }
    83%  { transform: translate(calc(var(--wx)*0.88), 80vh) rotate(148deg); }
    94%  { opacity: 0.65; }
    100% { transform: translate(var(--wx), 115vh) rotate(175deg); opacity: 0; }
  }

  /* Cloud drift right → left */
  @keyframes cloudDrift {
    from { left: 100%; }
    to   { left: calc(-1 * var(--cw)); }
  }

`;

export default function PageLayout({ children, back, className = '' }) {
  return (
    <div
      className="min-h-screen flex justify-center relative overflow-x-hidden"
      style={{
        backgroundImage: 'url(/forest2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Overlay */}
      <div className="absolute inset-0"
        style={{ backgroundColor: 'rgba(240, 255, 230, 0.1)' }} />

      {/* Clouds */}
      {CLOUDS.map(c => (
        <div key={c.id} className="absolute pointer-events-none select-none"
          style={{
            top: `${c.yRatio * 100}%`,
            '--cw': `${3.3 * c.r}px`,
            animation: `cloudDrift ${c.dur}s linear ${c.delay}s infinite`,
            zIndex: 1,
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.10))',
          }}>
          <CloudIcon r={c.r} />
        </div>
      ))}

      {/* Falling leaves (diagonal) */}
      {LEAVES.map(lf => (
        <div key={lf.id} className="absolute pointer-events-none select-none"
          style={{
            top: 0, left: lf.left,
            '--wx': `${lf.wx}px`,
            animation: `leafFall ${lf.dur}s linear ${lf.delay}s infinite`,
            zIndex: 2,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
          }}>
          <LeafIcon size={lf.size} color={lf.color} />
        </div>
      ))}

      {/* Butterflies & bees */}
      {CREATURES.map(c => (
        <div key={c.id} className="absolute pointer-events-none select-none"
          style={{
            top: c.top, left: c.left,
            '--dx': `${c.driftX}px`,
            '--dy': `${c.driftY}px`,
            animation: `${c.type === 'bee' ? 'beeFly' : 'butterflyFly'} ${c.dur}s ease-in-out ${c.delay}s infinite`,
            zIndex: 2,
            filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.20))',
          }}>
          {c.type === 'butterfly'
            ? <ButterflyIcon size={c.size} color1={c.color1} color2={c.color2} id={c.id} />
            : <BeeIcon size={c.size} />
          }
        </div>
      ))}

      {/* Page content */}
      <div className={`w-full max-w-sm flex flex-col px-5 pb-12 relative z-10 ${className}`}>
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
