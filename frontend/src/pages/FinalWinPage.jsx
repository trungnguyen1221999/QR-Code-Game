import { useNavigate } from 'react-router-dom';
import StoryModal from '../components/ui/StoryModal';

const WIN_SCENES = [
  { img: '/FS1.png', text: 'The capybara steps through the final portal, the magical wand glowing in hand...' },
  { img: '/FS2.png', text: 'The ancient forest erupts in brilliant light. The air shimmers with long-forgotten magic.' },
  { img: '/FS3.png', text: 'One by one, the collected items from the past begin to float and radiate power.' },
  { img: '/FS4.png', text: 'The mysterious force known as "X" shudders. Its dark grip over the land begins to loosen.' },
  { img: '/FS5.png', text: 'The rivers flow once more — clear, pure, and singing over stones that had been dry for generations.' },
  { img: '/FS6.png', text: 'Life rushes back into the forest. Trees burst into bloom, birdsong fills every shadow.' },
  { img: '/FS7.png', text: 'Animals that had turned against one another slowly approach, eyes wide, and bow their heads in peace.' },
  { img: '/FS8.png', text: 'The great natural kingdom is restored. Its towers glow golden in the light of a new dawn.' },
  { img: '/FS9.png', text: 'The capybara smiles, sets the wand gently in the earth, and watches the forest breathe again. The prophecy is fulfilled.' },
];

export default function FinalWinPage() {
  const navigate = useNavigate();
  return (
    <StoryModal
      scenes={WIN_SCENES}
      onDone={() => navigate('/live-leaderboard', { replace: true })}
      lastBtnLabel="See Leaderboard →"
    />
  );
}
