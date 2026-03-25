import { useState, useEffect } from 'react';
import Button from './Button';

const SCENES = [
  {
    img: '/scene1.png',
    title: 'Scene 1',
    text: 'In a vast and peaceful land of forests, rivers, and wildlife, all animals once lived in perfect balance. At the heart of this world stood a great natural kingdom, where harmony was maintained through unity and trust.',
  },
  {
    img: '/scene2.png',
    title: 'Scene 2',
    text: 'But everything changed when a mysterious force known only as "X" took control of the land. The rivers began to dry... The forests grew silent... And the animals turned against each other.',
  },
  {
    img: '/scene3.png',
    title: 'Scene 3',
    text: 'The ancestors of the forest knew that these days would come. They passed down the prophecy from generation to generation about a young capybara gifted by the Finnish forest god Tapio who will save this forest from that tragedy.',
  },
  {
    img: '/scene4.png',
    title: 'Scene 4',
    text: 'The rightful guardian of balance — a young capybara — was born and forced into hiding after the fall of the kingdom.',
  },
  {
    img: '/scene5.png',
    title: 'Scene 5',
    text: 'When the capybara grew up, the guardian animals around him passed down a time-travel magical wand which can open a time portal gifted by the Tapio god to the ancestors — in order to go back to the past and collect powerful items in the forest. Only the worthy heir can awaken the power trapped inside the wand.',
  },
  {
    img: '/scene6.png',
    title: 'Scene 6',
    text: 'The capybara opens the time travel portal with the wand, seeing the past peaceful and beautiful forest. With a backpack on his back, he is ready for the adventure to find the items from the past.',
  },
];

export default function IntroVideoModal({ open, onSkip }) {
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
  }, [current, open]);

  // Preload all scene images
  useEffect(() => {
    if (!open) return;
    SCENES.forEach(s => { new Image().src = s.img; });
  }, [open]);

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
    }, 400);
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
              transition: 'opacity 0.4s ease',
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
            animation: 'imgFadeIn 0.4s ease forwards',
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
          Skip
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
          transition: 'opacity 0.4s ease',
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
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          pointerEvents: displayed === scene.text ? 'auto' : 'none',
        }}>
          {current > 0 && (
            <Button variant="ghost" onClick={handlePrev}>
              ← Back
            </Button>
          )}
          <Button variant={isLast ? 'green' : 'primary'} onClick={handleNext}>
            {isLast ? 'Start Adventure →' : 'Next →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
