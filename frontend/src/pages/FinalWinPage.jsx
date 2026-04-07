import { useNavigate } from 'react-router-dom';
import StoryModal from '../components/ui/StoryModal';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function FinalWinPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const WIN_SCENES = [
    { img: '/FS1.png', text: t.finalWin1 },
    { img: '/FS2.png', text: t.finalWin2 },
    { img: '/FS3.png', text: t.finalWin3 },
    { img: '/FS4.png', text: t.finalWin4 },
    { img: '/FS5.png', text: t.finalWin5 },
    { img: '/FS6.png', text: t.finalWin6 },
    { img: '/FS7.png', text: t.finalWin7 },
    { img: '/FS8.png', text: t.finalWin8 },
    { img: '/FS9.png', text: t.finalWin9 },
  ];

  return (
    <StoryModal
      scenes={WIN_SCENES}
      onDone={() => navigate('/live-leaderboard', { replace: true })}
      lastBtnLabel={t.seeLeaderboard}
    />
  );
}