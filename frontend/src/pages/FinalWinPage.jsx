import { useNavigate } from 'react-router-dom';
import StoryModal from '../components/ui/StoryModal';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function FinalWinPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const WIN_SCENES = [
    { img: '/FS1.png', text: t.finalWinScene1Text },
    { img: '/FS2.png', text: t.finalWinScene2Text },
    { img: '/FS3.png', text: t.finalWinScene3Text },
    { img: '/FS4.png', text: t.finalWinScene4Text },
    { img: '/FS5.png', text: t.finalWinScene5Text },
    { img: '/FS6.png', text: t.finalWinScene6Text },
    { img: '/FS7.png', text: t.finalWinScene7Text },
    { img: '/FS8.png', text: t.finalWinScene8Text },
    { img: '/FS9.png', text: t.finalWinScene9Text },
  ];

  return (
    <StoryModal
      scenes={WIN_SCENES}
      onDone={() => navigate('/live-leaderboard', { replace: true })}
      lastBtnLabel={t.seeLeaderboard}
    />
  );
}