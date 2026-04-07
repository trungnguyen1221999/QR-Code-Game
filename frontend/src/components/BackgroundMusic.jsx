import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function getRouteTrack(pathname) {
  if (pathname === '/intro') return '/Songs/Opening song 2.mp3';
  if (pathname === '/final-intro') return '/Songs/middle scene.mp3';
  if (pathname === '/final-win') return '/Songs/CLosing song.mp3';
  return '/Songs/during game play song 1.mp3';
}

function getRouteVolume() {
  return 1.0;
}

const FADE_STEPS = 20;
const FADE_MS = 600;

export default function BackgroundMusic({ visible }) {
  const location = useLocation();
  const audioRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const targetTrack = getRouteTrack(location.pathname);
  const targetVolume = getRouteVolume();
  const targetTrackRef = useRef(null); // last track actually playing
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  // Unlock + start audio on first user interaction
  useEffect(() => {
    if (started) return;

    const startAudio = () => {
      if (!audioRef.current) return;
      const AudioCtx = window.AudioContext || window['webkitAudioContext'];
      if (AudioCtx) {
        const ctx = new AudioCtx();
        ctx.resume().then(() => ctx.close());
      }
      audioRef.current.src = targetTrack;
      audioRef.current.volume = targetVolume;
      audioRef.current.muted = false;
      audioRef.current.play().catch(() => {});
      targetTrackRef.current = targetTrack;
      setStarted(true);
    };

    ['click', 'touchstart', 'touchend', 'pointerdown'].forEach((e) =>
      document.addEventListener(e, startAudio, { once: true })
    );

    return () => {
      ['click', 'touchstart', 'touchend', 'pointerdown'].forEach((e) =>
        document.removeEventListener(e, startAudio)
      );
    };
  }, [started, targetTrack, targetVolume]);

  // Crossfade when track changes
  useEffect(() => {
    if (!started || !audioRef.current) return;
    if (targetTrack === targetTrackRef.current) return;
    targetTrackRef.current = targetTrack;

    const audio = audioRef.current;
    clearInterval(fadeTimerRef.current);

    const stepTime = FADE_MS / FADE_STEPS;
    const startVol = audio.volume;
    let step = 0;

    // Fade out current track
    fadeTimerRef.current = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVol * (1 - step / FADE_STEPS));

      if (step >= FADE_STEPS) {
        clearInterval(fadeTimerRef.current);

        // Switch track
        audio.src = targetTrack;
        audio.load();
        audio.volume = 0;

        if (!mutedRef.current) {
          audio.play().catch(() => {});

          // Fade in new track
          let inStep = 0;
          fadeTimerRef.current = setInterval(() => {
            inStep++;
            audio.volume = Math.min(
              targetVolume,
              targetVolume * inStep / FADE_STEPS
            );
            if (inStep >= FADE_STEPS) clearInterval(fadeTimerRef.current);
          }, stepTime);
        }
      }
    }, stepTime);

    return () => clearInterval(fadeTimerRef.current);
  }, [targetTrack, started, targetVolume]);

  const handleToggle = () => {
    if (!audioRef.current) return;

    if (!started) {
      audioRef.current.src = targetTrack;
      audioRef.current.volume = targetVolume;
      audioRef.current.muted = false;
      audioRef.current.play().catch(() => {});
      targetTrackRef.current = targetTrack;
      setStarted(true);
      setMuted(false);
      return;
    }

    if (audioRef.current) {
      const next = !muted;
      audioRef.current.muted = next;
      if (!next && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    }

    setMuted((v) => !v);
  };

  return (
    <>
      <audio ref={audioRef} loop preload="auto" />

      {visible && (
        <div
          style={{
            position: 'fixed',
            right: 20,
            bottom: 90,
            zIndex: 10000,
          }}
        >
          <button
            onClick={handleToggle}
            title={muted ? 'Unmute music' : 'Mute music'}
            style={{
              //position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              padding: '8px 14px',
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
            }}
          >
            {muted ? '🔇' : '🎵'}
          </button>
        </div>
      )}
    </>
  );
}