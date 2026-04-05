import Button from './Button';

export default function AllCheckpointsClearedContent({ onContinue }) {
  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <img
        src="/beforeFinalGame.png"
        alt="All checkpoints cleared"
        className="w-36 h-36 object-contain"
      />
      <p className="text-base font-bold" style={{ color: 'var(--color-text)', lineHeight: '1.6' }}>
        All checkpoints cleared! Get ready for the final challenge.
      </p>
      <Button variant="green" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
