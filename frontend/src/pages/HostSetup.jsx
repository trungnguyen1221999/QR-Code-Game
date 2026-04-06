import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Clock, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useLanguage } from '../context/LanguageContext.jsx';
import { translate } from '../translations/index';

export default function HostSetup({ onLogout }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const host = JSON.parse(localStorage.getItem('host'));
  const [gameName, setGameName] = useState('');
  const [time, setTime] = useState(30);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameMode, setGameMode] = useState('ordered');

  const handleLogout = () => {
    onLogout?.();
    toast.success(t.loggedOut);
    navigate('/host-login');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!gameName.trim()) {
      toast.error(t.pleaseEnterGameName);
      return;
    }
    if (!host) {
      toast.error(t.notLoggedIn);
      navigate('/host-login');
      return;
    }
    navigate('/select-games', {
      state: { name: gameName.trim(), time, difficulty, gameMode },
    });
  };

  return (
    <PageLayout back="/">
      <div className="pt-4 pb-8">
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Host greeting + logout */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>{t.loggedInAsHost}</p>
                <p className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
                  {translate(t.helloUser, { name: host?.name || host?.username || '' })}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#FEE2E2', color: 'var(--color-red)' }}
              >
                <LogOut size={13} />
                {t.logout}
              </button>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>{t.hostGameSetup}</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
                {t.configureGameSettings}
              </p>
            </div>

            {/* Game name */}
            <Input
              label={t.gameName}
              icon={<Gamepad2 size={14} />}
              placeholder={t.enterGameName}
              value={gameName}
              onChange={e => setGameName(e.target.value)}
            />

            {/* Total game time slider */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                <Clock size={14} style={{ color: 'var(--color-primary)' }} />
                {t.totalGameTime} <span className="font-bold ml-1">{translate(t.minutesCount, { count: time })}</span>
              </label>
              <input
                type="range"
                min={15}
                max={120}
                step={5}
                value={time}
                onChange={e => setTime(Number(e.target.value))}
                className="w-full accent-orange-600"
              />
              <div className="flex justify-between text-xs" style={{ color: 'var(--color-subtext)' }}>
                <span>{translate(t.minutesShortCount, { count: 15 })}</span>
                <span>{translate(t.minutesShortCount, { count: 120 })}</span>
              </div>
            </div>

            {/* Game structure info */}
            <div className="rounded-xl p-4 flex flex-col gap-1" style={{ backgroundColor: 'var(--color-info-bg)' }}>
              <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-text)' }}>{t.gameStructure}</p>
              {[
                t.gameStructureQrCheckpoints,
                t.gameStructureMiniGames,
                t.gameStructureQuiz,
                t.gameStructureFinalGame,
              ].map(item => (
                <p key={item} className="text-sm" style={{ color: 'var(--color-subtext)' }}>• {item}</p>
              ))}
            </div>

            {/* Game Mode */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {t.gameMode}
              </label>
              {[
                {
                  value: 'ordered',
                  label: t.orderedMode,
                  desc: t.orderedModeDesc,
                  emoji: '🔢',
                },
                {
                  value: 'random',
                  label: t.randomMode,
                  desc: t.randomModeDesc,
                  emoji: '🔀',
                },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGameMode(opt.value)}
                  className="flex items-start gap-3 rounded-xl p-3 text-left transition-all"
                  style={{
                    border: gameMode === opt.value ? '2px solid var(--color-primary)' : '2px solid #E5E7EB',
                    backgroundColor: gameMode === opt.value ? 'var(--color-info-bg)' : 'transparent',
                  }}
                >
                  <div className="mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                    style={{ border: '2px solid var(--color-primary)', backgroundColor: gameMode === opt.value ? 'var(--color-primary)' : 'transparent' }}>
                    {gameMode === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{opt.emoji} {opt.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-subtext)' }}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Game Level */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {t.gameLevel}
              </label>
              {[
                { value: 'easy', label: t.easy, desc: t.easyDesc, emoji: '🧸' },
                { value: 'normal', label: t.normal, desc: t.normalDesc, emoji: '🐼' },
                { value: 'hard', label: t.hard, desc: t.hardDesc, emoji: '🐻' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value)}
                  className="flex items-start gap-3 rounded-xl p-3 text-left transition-all"
                  style={{
                    border: difficulty === opt.value ? '2px solid var(--color-primary)' : '2px solid #E5E7EB',
                    backgroundColor: difficulty === opt.value ? 'var(--color-info-bg)' : 'transparent',
                  }}
                >
                  <div className="mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                    style={{ border: '2px solid var(--color-primary)', backgroundColor: difficulty === opt.value ? 'var(--color-primary)' : 'transparent' }}>
                    {difficulty === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{opt.emoji} {opt.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-subtext)' }}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <Button type="submit">{t.nextSelectGames}</Button>

          </form>
        </Card>
      </div>
    </PageLayout>
  );
}