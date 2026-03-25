import { useState, useEffect } from 'react';

export default function StoryModal({ scenes, onDone, lastBtnLabel = 'Continue →' }) {
  const [current, setCurrent]         = useState(0);
  const [leaving, setLeaving]         = useState(null);
  const [fading, setFading]           = useState(false);
  const [displayed, setDisplayed]     = useState('');
  const [textVisible, setTextVisible] = useState(true);

  const scene  = scenes[current];
  const isLast = current === scenes.length - 1;

  useEffect(() => {
    scenes.forEach(s => { new Image().src = s.img; });
  }, []);

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const iv = setInterval(() => {
      i++; setDisplayed(scene.text.slice(0, i));
      if (i >= scene.text.length) clearInterval(iv);
    }, 10);
    return () => clearInterval(iv);
  }, [current]);

  const goTo = (next) => {
    setLeaving(current); setFading(true); setTextVisible(false);
    setTimeout(() => { setCurrent(next); setLeaving(null); setFading(false); setTextVisible(true); }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div className="relative" style={{ flexShrink: 0 }}>
        {leaving !== null && (
          <img src={scenes[leaving].img} alt="" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover',
            opacity: fading ? 0 : 1, transition: 'opacity 1s ease', zIndex: 1,
          }} />
        )}
        <img key={current} src={scene.img} alt="" style={{ width: '100%', height: 'auto', display: 'block', animation: 'imgFadeIn 1s ease forwards' }} />
        <style>{`@keyframes imgFadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {scenes.map((_, i) => (
            <div key={i} style={{ width: i === current ? 20 : 8, height: 8, borderRadius: 4, backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.4)', transition: 'width 0.2s' }} />
          ))}
        </div>
      </div>
      <div style={{ backgroundColor: 'var(--color-bg)', padding: '20px 24px 28px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, opacity: textVisible ? 1 : 0, transition: 'opacity 1s ease' }}>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-text)', margin: 0 }}>{displayed}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 4, opacity: displayed === scene.text ? 1 : 0, transform: displayed === scene.text ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 1s ease, transform 1s ease', pointerEvents: displayed === scene.text ? 'auto' : 'none' }}>
          {current > 0 && (
            <button onClick={() => goTo(current - 1)} style={{ padding: '10px 20px', borderRadius: 12, border: '2px solid #E5E7EB', backgroundColor: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              ← Back
            </button>
          )}
          <button onClick={() => isLast ? onDone() : goTo(current + 1)} style={{ flex: 1, padding: '12px 20px', borderRadius: 12, border: 'none', backgroundColor: isLast ? '#22C55E' : 'var(--color-primary)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
            {isLast ? lastBtnLabel : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
