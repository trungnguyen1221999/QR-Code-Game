import Button from './Button';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function AllCheckpointsClearedContent({ onContinue }) {
  const { t } = useLanguage();

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
      <Button variant="green" onClick={onContinue}>
        {t.continue}
      </Button>
    </div>
  );
}