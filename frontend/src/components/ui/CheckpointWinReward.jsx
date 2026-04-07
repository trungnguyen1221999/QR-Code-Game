import { getCheckpointSecretReward } from '../../utils/checkpointRewards';
import { isFinalCheckpointClear } from '../../utils/finalCheckpointFlow';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { translate } from '../../translations/index';

export default function CheckpointWinReward({ checkpoint, title, message }) {
  const { t } = useLanguage();
  const reward = getCheckpointSecretReward(checkpoint);
  const finalCheckpointCleared = isFinalCheckpointClear(checkpoint);

  if (finalCheckpointCleared) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <img
          src="/beforeFinalGame.png"
          alt={t.allCheckpointsCleared}
          className="w-36 h-36 object-contain"
        />
        <p className="text-base font-bold" style={{ color: 'var(--color-text)', lineHeight: '1.6' }}>
          {t.allCheckpointsCleared}
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes checkpoint-reward-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.03); }
        }

        @keyframes checkpoint-reward-shine {
          0% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
          20% { opacity: 0.55; }
          60% { opacity: 0.15; }
          100% { transform: translateX(160%) skewX(-18deg); opacity: 0; }
        }

        @keyframes checkpoint-reward-text-glow {
          0%, 100% {
            text-shadow: 0 0 0 rgba(250, 204, 21, 0.1), 0 0 0 rgba(249, 115, 22, 0.1);
          }
          50% {
            text-shadow: 0 0 10px rgba(250, 204, 21, 0.55), 0 0 18px rgba(249, 115, 22, 0.35);
          }
        }
      `}</style>

      <div
        className="relative flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center overflow-hidden rounded-[28px] sm:rounded-[36px]"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.96) 0%, rgba(254,243,199,0.92) 45%, rgba(253,230,138,0.88) 100%)',
          boxShadow:
            '0 14px 28px rgba(245, 158, 11, 0.24), inset 0 1px 0 rgba(255,255,255,0.9)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-16"
          style={{
            background:
              'linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.82) 50%, rgba(255,255,255,0) 100%)',
            animation: 'checkpoint-reward-shine 2.8s ease-in-out infinite',
          }}
        />
        <img
          src={reward.image}
          alt={reward.name}
          className="relative z-10 h-40 object-contain drop-shadow-[0_10px_20px_rgba(249,115,22,0.28)]"
          style={{ animation: 'checkpoint-reward-float 2.4s ease-in-out infinite' }}
        />
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--color-text)' }}>
          {title}
        </h3>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
          {message}
        </p>
        <p
          className="mt-2 sm:mt-3 text-sm sm:text-base font-extrabold tracking-[0.01em]"
          style={{
            color: '#B45309',
            animation: 'checkpoint-reward-text-glow 2.2s ease-in-out infinite',
          }}
        >
          {translate(t.secretItemReward, { item: reward.name })}
        </p>
      </div>
    </>
  );
}