import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function getRouteTrack(pathname) {
  if (pathname === '/intro') return '/Songs/Opening song 2.mp3';
  if (pathname === '/final-intro') return '/Songs/middle scene.mp3';
  if (pathname === '/final-win') return '/Songs/CLosing song.mp3';
  return '/Songs/during game play song 1.mp3';
}

const FADE_STEPS = 20;
const FADE_MS = 600;

export default function BackgroundMusic({ muted }) {
  const location = useLocation();
  const audioRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const startedRef = useRef(false);
  const targetTrackRef = useRef(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const targetTrack = getRouteTrack(location.pathname);

  // Unlock + start audio on first user interaction
  useEffect(() => {
    const startAudio = () => {
      if (startedRef.current || !audioRef.current) return;
      const AudioCtx = window.AudioContext || window['webkitAudioContext'];
      if (AudioCtx) { const ctx = new AudioCtx(); ctx.resume().then(() => ctx.close()); }
      audioRef.current.src = targetTrack;
      audioRef.current.volume = 1.0;
      audioRef.current.muted = mutedRef.current;
      audioRef.current.play().catch(() => {});
      targetTrackRef.current = targetTrack;
      startedRef.current = true;
    };
    ['click', 'touchstart', 'touchend', 'pointerdown'].forEach(e =>
      document.addEventListener(e, startAudio, { once: true })
    );
    return () => {
      ['click', 'touchstart', 'touchend', 'pointerdown'].forEach(e =>
        document.removeEventListener(e, startAudio)
      );
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync muted state to audio element
  useEffect(() => {
    if (!audioRef.current || !startedRef.current) return;
    audioRef.current.muted = muted;
    if (!muted && audioRef.current.paused) audioRef.current.play().catch(() => {});
  }, [muted]);

  // Crossfade when track changes
  useEffect(() => {
    if (!startedRef.current || !audioRef.current) return;
    if (targetTrack === targetTrackRef.current) return;
    targetTrackRef.current = targetTrack;

    const audio = audioRef.current;
    clearInterval(fadeTimerRef.current);

    const stepTime = FADE_MS / FADE_STEPS;
    const startVol = audio.volume;
    let step = 0;

    fadeTimerRef.current = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVol * (1 - step / FADE_STEPS));
      if (step >= FADE_STEPS) {
        clearInterval(fadeTimerRef.current);
        audio.src = targetTrack;
        audio.load();
        audio.volume = 0;
        if (!mutedRef.current) {
          audio.play().catch(() => {});
          let inStep = 0;
          fadeTimerRef.current = setInterval(() => {
            inStep++;
            audio.volume = Math.min(1.0, inStep / FADE_STEPS);
            if (inStep >= FADE_STEPS) clearInterval(fadeTimerRef.current);
          }, stepTime);
        }
      }
    }, stepTime);

    return () => clearInterval(fadeTimerRef.current);
  }, [targetTrack]);

  return <audio ref={audioRef} loop preload="auto" />;
}
