import { useNavigate, useLocation } from 'react-router-dom';
import StoryModal from '../components/ui/StoryModal';

const BEFORE_GAME_TEXT = 'The grown-up capybara heir, returning from past to the current world to reclaim his place, restore balance, and destroy mystery “X” force with the items he got along the time travel journey to overcome the final test. Here comes the river of the judgement.';

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
