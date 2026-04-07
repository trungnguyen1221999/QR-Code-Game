import Button from './Button';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function AllCheckpointsClearedContent({ onContinue }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <style>{`
        @keyframes final-reward-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.04); }
        }

        @keyframes final-reward-shine {
          0% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
          20% { opacity: 0.6; }
          60% { opacity: 0.18; }
          100% { transform: translateX(160%) skewX(-18deg); opacity: 0; }
        }

        @keyframes final-reward-text-glow {
          0%, 100% {
            text-shadow: 0 0 0 rgba(250, 204, 21, 0.15), 0 0 0 rgba(249, 115, 22, 0.2);
          }
          50% {
            text-shadow: 0 0 14px rgba(250, 204, 21, 0.55), 0 0 24px rgba(249, 115, 22, 0.38);
          }
        }
      `}</style>

      <img
        src="/beforeFinalGame.png"
        alt={t.allCheckpointsCleared}
        className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
      />
      <p className="text-base font-bold" style={{ color: 'var(--color-text)', lineHeight: '1.6' }}>
        {t.allCheckpointsCleared}
      </p>
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {[
          { src: '/storyItem/sacredhammer(whakAMole).png', alt: 'Hammer' },
          { src: '/storyItem/sacredhat(memory).png', alt: 'Hat' },
        ].map((item) => (
          <div
            key={item.src}
            className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center overflow-hidden rounded-[24px]"
            style={{
              background:
                'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.98) 0%, rgba(254,243,199,0.95) 46%, rgba(253,230,138,0.88) 100%)',
              boxShadow:
                '0 14px 30px rgba(245, 158, 11, 0.22), inset 0 1px 0 rgba(255,255,255,0.92)',
              border: '1px solid rgba(245, 158, 11, 0.28)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-14"
              style={{
                background:
                  'linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.86) 50%, rgba(255,255,255,0) 100%)',
                animation: 'final-reward-shine 2.7s ease-in-out infinite',
              }}
            />
            <img
              src={item.src}
              alt={item.alt}
              className="relative z-10 h-24 sm:h-28 object-contain drop-shadow-[0_10px_20px_rgba(249,115,22,0.3)]"
              style={{ animation: 'final-reward-float 2.4s ease-in-out infinite' }}
            />
          </div>
        ))}
      </div>
      <p
        className="max-w-[18rem] text-sm sm:text-base font-extrabold leading-6"
        style={{
          color: '#B45309',
          animation: 'final-reward-text-glow 2.2s ease-in-out infinite',
        }}
      >
        {t.twoPreciousItemsReward}
      </p>
      <Button variant="green" onClick={onContinue}>
        {t.continue}
      </Button>
    </div>
  );
}
