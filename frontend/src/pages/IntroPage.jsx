import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IntroVideoModal from '../components/ui/IntroVideoModal';

export default function IntroPage() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('session') || 'null');
  const introKey = `introPlayed_${session?.id || session?._id}`;

  // If intro was already played this session, skip straight to game
  useEffect(() => {
    if (sessionStorage.getItem(introKey)) {
      navigate('/game', { replace: true });
    }
  }, []);

  const handleDone = () => {
    sessionStorage.setItem(introKey, '1');
    navigate('/game', { replace: true });
  };

  // Don't render the modal if already played (avoid flash)
  if (sessionStorage.getItem(introKey)) return null;

  return <IntroVideoModal open={true} onSkip={handleDone} />;
}
