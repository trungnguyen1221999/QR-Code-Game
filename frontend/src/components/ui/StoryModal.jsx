import { useState, useEffect, useCallback } from 'react';

export default function StoryModal({ scenes, onDone, lastBtnLabel = 'Continue →' }) {
  const [current, setCurrent]     = useState(0);
  const [leaving, setLeaving]     = useState(null);
  const [fading, setFading]       = useState(false);
  const [displayed, setDisplayed] = useState('');
  const [textDone, setTextDone]   = useState(false);
  const [textVisible, setTextVisible] = useState(true);

  const scene  = scenes[current];
  const isLast = current === scenes.length - 1;
  const fullText = scene?.text || '';

  // Preload images
  useEffect(() => {
    scenes.forEach(s => { new Image().src = s.img; });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Typing effect
  useEffect(() => {
    setDisplayed('');
    setTextDone(false);
    if (!fullText) { setTextDone(true); return; }
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) { clearInterval(iv); setTextDone(true); }
    }, 18);
    return () => clearInterval(iv);
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tap anywhere to skip typing
  const skipOrNext = useCallback(() => {
    if (!textDone) {
      setDisplayed(fullText);
      setTextDone(true);
    }
  }, [textDone, fullText]);

  const goTo = (next) => {
    setLeaving(current); setFading(true); setTextVisible(false);
    setTimeout(() => {
      setCurrent(next); setLeaving(null); setFading(false); setTextVisible(true);
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
      onClick={skipOrNext}
    >
      {/* Image — fixed height */}
      <div className="relative" style={{ flexShrink: 0, overflow: 'hidden', backgroundColor: '#000' }}>
        {leaving !== null && (
          <img src={scenes[leaving].img} alt="" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            opacity: fading ? 0 : 1, transition: 'opacity 0.5s ease', zIndex: 1,
          }} />
        )}
        <img
          key={current}
          src={scene.img}
          alt=""
          style={{ width: '100%', height: 'auto', display: 'block', animation: 'storyImgIn 0.5s ease forwards' }}
        />
        <style>{`@keyframes storyImgIn { from { opacity:0 } to { opacity:1 } }`}</style>

        {/* Dot indicators */}
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 2 }}>
          {scenes.map((_, i) => (
            <div key={i} style={{
              width: i === current ? 18 : 7, height: 7, borderRadius: 4,
              backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.45)',
              transition: 'width 0.2s',
            }} />
          ))}
        </div>
      </div>

      {/* Text + buttons — always visible */}
      <div
        style={{
          flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12,
          padding: '16px 20px 24px',
          opacity: textVisible ? 1 : 0, transition: 'opacity 0.4s ease',
        }}
      >
        <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--color-text)', margin: 0 }}>
          {displayed}
          {!textDone && <span style={{ opacity: 0.5 }}>|</span>}
        </p>

        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {current > 0 && (
            <button
              onClick={() => goTo(current - 1)}
              style={{ padding: '11px 18px', borderRadius: 12, border: '2px solid #E5E7EB', backgroundColor: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14, flexShrink: 0 }}
            >
              ←
            </button>
          )}
          <button
            onClick={() => {
              if (!textDone) { setDisplayed(fullText); setTextDone(true); return; }
              isLast ? onDone() : goTo(current + 1);
            }}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: 'none', backgroundColor: isLast ? '#22C55E' : 'var(--color-primary)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}
          >
            {!textDone ? 'Skip ⏭' : isLast ? lastBtnLabel : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
