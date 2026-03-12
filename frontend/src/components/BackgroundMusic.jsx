import { useState, useRef, useEffect } from 'react';

export default function BackgroundMusic() {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  // Start audio on first user interaction with the page
  useEffect(() => {
    const startAudio = () => {
      if (!started && audioRef.current) {
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => {});
        setStarted(true);
      }
    };
    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('touchstart', startAudio, { once: true });
    return () => {
      document.removeEventListener('click', startAudio);
      document.removeEventListener('touchstart', startAudio);
    };
  }, [started]);

  const handleToggle = () => {
    if (!started && audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {});
      setStarted(true);
      setMuted(false);
      return;
    }
    if (audioRef.current) {
      audioRef.current.muted = !muted;
    }
    setMuted(v => !v);
  };

  return (
    <>
      <audio ref={audioRef} src="/backgroundmusic.mp3" loop preload="auto" />
      <button
        onClick={handleToggle}
        title={muted ? 'Unmute music' : 'Mute music'}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '999px',
          padding: '8px 14px',
          fontSize: '18px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
        }}
      >
        {muted ? '🔇' : '🎵'}
      </button>
    </>
  );
}
