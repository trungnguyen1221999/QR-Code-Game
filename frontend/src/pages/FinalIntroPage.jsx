import { useNavigate, useLocation } from 'react-router-dom';
import StoryModal from '../components/ui/StoryModal';

const BEFORE_GAME_TEXT = 'The capybara has collected all the magical items from the past. Now the final trial awaits — cross the ancient bridge over the crocodile-filled waters and claim your destiny!';

export default function FinalIntroPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const gameState = location.state ?? {};
  return (
    <StoryModal
      scenes={[{ img: '/beforeFinalGame.png', text: BEFORE_GAME_TEXT }]}
      onDone={() => navigate('/final-challenge', { replace: true, state: gameState })}
      lastBtnLabel="Start Adventure →"
    />
  );
}
