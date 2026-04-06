import { useEffect, useState } from 'react';
import BackgroundMusic from './BackgroundMusic';
import { useLanguage } from '../context/LanguageContext';

export default function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.35)',
            zIndex: 9997,
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
        }}
      >
        {open && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: '10px',
              borderRadius: '18px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              minWidth: '140px',
            }}
          >
            <button
              onClick={() => handleLanguageChange('FI')}
              style={menuButtonStyle(language === 'FI')}
            >
              FI
            </button>

            <button
              onClick={() => handleLanguageChange('EN')}
              style={menuButtonStyle(language === 'EN')}
            >
              EN
            </button>

            <div>
              <BackgroundMusic />
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen((prev) => !prev)}
          title="Open menu"
          aria-label="Open floating menu"
          style={{
            border: 'none',
            borderRadius: '999px',
            padding: '10px 16px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {open ? '✕' : '⚙️'}
        </button>
      </div>
    </>
  );
}

function menuButtonStyle(active) {
  return {
    width: '100%',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 12px',
    background: active ? 'var(--color-primary)' : '#F3F4F6',
    color: active ? '#FFFFFF' : '#111827',
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'Nunito, sans-serif',
  };
}