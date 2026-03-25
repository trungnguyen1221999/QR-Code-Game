import { useNavigate } from 'react-router-dom';
import StoryModal from '../components/ui/StoryModal';

const WIN_SCENES = [
  {
    img: '/FS1.png',
    text: 'At the end of a long and unforgiving journey… when hope itself seemed fragile — the capybara heir stands at last before the heart of all corruption. The force that consumed the forest. The force whispered in fear as "X."',
  },
  {
    img: '/FS2.png',
    text: 'With relics forged by time… and wisdom carried across generations — the heir calls upon every power earned through struggle and sacrifice. Light surges against darkness — as the fate of the forest hangs in a single moment.',
  },
  {
    img: '/FS3.png',
    text: 'The darkness trembles… cracks… and begins to fall apart. But within the ruins of destruction — a hidden truth awakens.',
  },
  {
    img: '/FS4.png',
    text: 'From the dying storm of shadow… a divine presence emerges. Ancient. Calm. Unshaken. The force called "X"… was never meant to destroy.',
  },
  {
    img: '/FS5.png',
    text: 'It was a trial. Forged by Tapio — guardian of the forest. To test the spirit of all life. To challenge their will to endure… their instinct to survive… their strength to rise again. And to seek the one worthy of guiding the forest forward.',
  },
  {
    img: '/FS6.png',
    text: 'Through suffering… through chaos… through the breaking of balance — the forest has spoken. Not through words — but through those who stood when all else fell. All the surviving souls gather to cheer the great success of their new king.',
  },
  {
    img: '/FS7.png',
    text: 'And now… the child once hidden in shadows… stands as the answer to the forest\'s call. Not defined by power alone — but by courage in darkness… wisdom through time… and unity with all life. The heir has become worthy.',
  },
  {
    img: '/FS8.png',
    text: 'The trial ends. The corruption fades like a forgotten nightmare. Roots breathe again. Rivers sing once more. Life returns to the forest. Balance… is reborn.',
  },
  {
    img: '/FS9.png',
    text: 'The heir has returned… not to claim a throne — but to become something greater. A protector. A guide. A guardian of all that lives in this forest. And as long as the forest stands… so too will its true king.',
  },
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
