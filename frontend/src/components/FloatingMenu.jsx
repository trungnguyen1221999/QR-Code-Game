import { useEffect, useState } from 'react';
import BackgroundMusic from './BackgroundMusic';
import { useLanguage } from '../context/LanguageContext';

const LANG_OPTIONS = [
  { code: 'FI', label: 'Suomi' },
  { code: 'EN', label: 'English' },
];

export default function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <BackgroundMusic muted={muted} onToggle={setMuted} />

      {open && (
        <div
          className="fixed inset-0 z-9997 bg-black/25"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed right-5 bottom-5 z-9999 flex flex-col items-end gap-2.5">

        {open && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3.5 flex flex-col gap-3 w-44">

            {/* Music */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                🎵 {t.musicLabel}
              </span>
              <button
                onClick={() => setMuted(v => !v)}
                className={`text-xs font-bold px-3 py-1 rounded-full border-none cursor-pointer ${muted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {muted ? 'OFF' : 'ON'}
              </button>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Language */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {t.languageLabel}
              </p>
              <div className="flex gap-1.5">
                {LANG_OPTIONS.map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={`flex-1 py-2 rounded-xl border-none text-sm font-bold cursor-pointer transition-all ${language === code ? 'text-white' : 'bg-gray-100 text-gray-700'}`}
                    style={{
                      backgroundColor: language === code ? 'var(--color-primary)' : undefined,
                      fontFamily: 'Nunito, sans-serif',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen(v => !v)}
          className="rounded-full px-4 py-2.5 text-white text-lg font-bold border-none cursor-pointer shadow-md"
          style={{ backgroundColor: 'var(--color-primary)', fontFamily: 'Nunito, sans-serif' }}
        >
          {open ? '✕' : '⚙️'}
        </button>
      </div>
    </>
  );
}
