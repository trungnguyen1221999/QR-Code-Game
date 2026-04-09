import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BackgroundMusic from './BackgroundMusic';
import HostGuideModal from './ui/HostGuideModal';
import { useLanguage } from '../context/LanguageContext';

const LANG_OPTIONS = [
  { code: 'FI', label: 'Suomi' },
  { code: 'EN', label: 'English' },
];

export default function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { pathname } = useLocation();
  const isHostSetup = pathname === '/host-setup';

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <BackgroundMusic muted={muted} onToggle={setMuted} />

      {open && (
        <div className="fixed inset-0 z-9997" onClick={() => setOpen(false)} />
      )}

      <div className="fixed right-4 bottom-4 z-9999 flex flex-col items-end gap-2">

        {open && (
          <div
            className="rounded-2xl shadow-lg overflow-hidden"
            style={{ backgroundColor: 'white', width: 170 }}
          >
            {/* Music row */}
            <button
              onClick={() => setMuted(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3"
              style={{ backgroundColor: 'white', border: 'none', cursor: 'pointer' }}
            >
              <span className="text-sm font-bold text-gray-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                🎵 {t.musicLabel}
              </span>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: muted ? '#FEE2E2' : '#D1FAE5',
                  color: muted ? '#DC2626' : '#059669',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                {muted ? 'OFF' : 'ON'}
              </span>
            </button>

            <div className="h-px bg-gray-100 mx-3" />

            {/* Language buttons */}
            <div className="p-2 flex gap-1.5">
              {LANG_OPTIONS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => { setLanguage(code); setOpen(false); }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-all"
                  style={{
                    backgroundColor: language === code ? 'var(--color-primary)' : '#F3F4F6',
                    color: language === code ? '#fff' : '#6B7280',
                    fontFamily: 'Nunito, sans-serif',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {isHostSetup && (
              <>
                <div className="h-px bg-gray-100 mx-3" />
                <div className="p-2">
                  <button
                    onClick={() => { setShowGuide(true); setOpen(false); }}
                    className="w-full py-2 rounded-xl text-xs font-bold border-none cursor-pointer"
                    style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontFamily: 'Nunito, sans-serif' }}
                  >
                    📖 {t.hostGuideTitle}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {showGuide && <HostGuideModal onClose={() => setShowGuide(false)} />}

        {/* Trigger */}
        <button
          onClick={() => setOpen(v => !v)}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white border-none cursor-pointer shadow-md text-lg"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {open ? '✕' : '⚙️'}
        </button>
      </div>
    </>
  );
}
