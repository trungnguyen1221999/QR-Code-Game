import { useNavigate, useLocation } from 'react-router-dom';
import StoryModal from '../components/ui/StoryModal';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function FinalIntroPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const gameState = location.state ?? {};
  return (
    <StoryModal
      scenes={[{ img: '/beforeFinalGame.png', text: t.finalIntroText }]}
      onDone={() => navigate('/final-challenge', { replace: true, state: gameState })}
      lastBtnLabel={t.startAdventure}
    />
  );
}