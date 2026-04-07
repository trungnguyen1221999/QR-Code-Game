import { useState, useEffect } from 'react';
import Button from './Button';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function IntroVideoModal({ open, onSkip }) {
  const { t } = useLanguage();

  const SCENES = [
    {
      img: '/OScene1.png',
      title: t.introScene1Title,
      text: t.introScene1Text,
    },
    {
      img: '/OScene2.png',
      title: t.introScene2Title,
      text: t.introScene2Text,
    },
    {
      img: '/OScene3.png',
      title: t.introScene3Title,
      text: t.introScene3Text,
    },
    {
      img: '/OScene4.png',
      title: t.introScene4Title,
      text: t.introScene4Text,
    },
    {
      img: '/OScene5.png',
      title: t.introScene5Title,
      text: t.introScene5Text,
    },
    {
      img: '/OScene6.png',
      title: t.introScene6Title,
      text: t.introScene6Text,
    },
  ];

  const [current, setCurrent] = useState(0);
  const [leaving, setLeaving] = useState(null);
  const [fading, setFading] = useState(false);
  const [displayed, setDisplayed] = useState('');
  const [textVisible, setTextVisible] = useState(true);

  const scene = SCENES[current];
  const isLast = current === SCENES.length - 1;

  useEffect(() => {
    if (!open) return;
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(scene.text.slice(0, i));
      if (i >= scene.text.length) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [current, open, scene.text]);

  // Preload all scene images
  useEffect(() => {
    if (!open) return;
    SCENES.forEach(s => { new Image().src = s.img; });
  }, [open, SCENES]);

  if (!open) return null;

  const goTo = (next) => {
    setLeaving(current);
    setFading(true);
    setTextVisible(false);
    setTimeout(() => {
      setCurrent(next);
      setLeaving(null);
      setFading(false);
      setTextVisible(true);
    }, 700);
  };

  const handleNext = () => {
    if (isLast) onSkip();
    else goTo(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) goTo(current - 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ width: '100vw', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
    >
      {/* Image */}
      <div className="relative" style={{ flexShrink: 0 }}>
        {/* Leaving image fades out */}
        {leaving !== null && (
          <img
            src={SCENES[leaving].img}
            alt=""
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: fading ? 0 : 1,
              transition: 'opacity 1s ease',
              zIndex: 1,
            }}
          />
        )}
        {/* Current image fades in */}
        <img
          key={current}
          src={scene.img}
          alt={scene.title}
          style={{
            width: '100%', height: 'auto', display: 'block',
            animation: 'imgFadeIn 1s ease forwards',
          }}
        />
        <style>{`@keyframes imgFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

        {/* Skip button */}
        <button
          onClick={onSkip}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {t.skip}
        </button>

        {/* Scene indicator dots */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
          }}
        >
          {SCENES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === current ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.4)',
                transition: 'width 0.2s, background-color 0.2s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Text + navigation */}
      <div
        style={{
          backgroundColor: 'var(--color-bg)',
          padding: '20px 24px 28px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: textVisible ? 1 : 0,
          transition: 'opacity 1s ease',
        }}
      >
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          {displayed}
        </p>
        <div style={{
          display: 'flex', gap: 10, marginTop: 4,
          opacity: displayed === scene.text ? 1 : 0,
          transform: displayed === scene.text ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 1s ease, transform 1s ease',
          pointerEvents: displayed === scene.text ? 'auto' : 'none',
        }}>
          {current > 0 && (
            <Button variant="ghost" onClick={handlePrev}>
              {t.back}
            </Button>
          )}
          <Button variant={isLast ? 'green' : 'primary'} onClick={handleNext}>
            {isLast ? t.startAdventure : t.next}
          </Button>
        </div>
      </div>
    </div>
  );
}