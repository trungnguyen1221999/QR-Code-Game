import Button from './Button';

export default function GameStartOverlay({
  show,
  onStart,
  title = 'Ready?',
  description = 'Press Start to begin.',
  startLabel = 'Start',
  disabled = false,
}) {
  if (!show) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] px-5 text-center"
      style={{
        background: 'rgba(255, 255, 255, 0.32)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        className="w-full max-w-xs rounded-[28px] px-5 py-6"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(254,243,199,0.94) 100%)',
          boxShadow: '0 18px 32px rgba(15, 23, 42, 0.16)',
          border: '1px solid rgba(245, 158, 11, 0.18)',
        }}
      >
        <p className="text-lg font-black" style={{ color: 'var(--color-text)' }}>
          {title}
        </p>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-subtext)' }}>
          {description}
        </p>
        <div className="mt-4">
          <Button variant="green" onClick={onStart} disabled={disabled}>
            {startLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
