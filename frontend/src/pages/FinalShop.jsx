import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import { getSessionDifficulty } from '../utils/constantMiniGame';
import { useLanguage } from '../context/LanguageContext.jsx';
import { translate } from '../translations/index';

const BASE_BUDDY  = 1;
const MAX_LIVES   = 6;
const MAX_BUDDY   = 15;
const BASE_PRICE  = 100;
const PRICE_STEP  = 50;

function getBaseLives(difficulty) {
  if (difficulty === 'easy')   return Infinity;
  if (difficulty === 'normal') return 3;
  return 2; // hard
}

const nextPrice = (bought) => BASE_PRICE + bought * PRICE_STEP;

export default function FinalShop() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { t } = useLanguage();
  const baseCoins  = location.state?.coins ?? 1000;
  const difficulty = getSessionDifficulty();
  const BASE_LIVES = getBaseLives(difficulty);
  const isEasy     = difficulty === 'easy';

  const [coins, setCoins]             = useState(baseCoins);
  const [boughtLives, setBoughtLives] = useState(0);
  const [boughtBuddy, setBoughtBuddy] = useState(0);

  const totalLives = BASE_LIVES === Infinity ? Infinity : BASE_LIVES + boughtLives;
  const totalBuddy = BASE_BUDDY + boughtBuddy;
  const lifePrice  = nextPrice(boughtLives);
  const buddyPrice = nextPrice(boughtBuddy);

  const canBuyLife  = !isEasy && totalLives < MAX_LIVES && coins >= lifePrice;
  const canBuyBuddy = boughtBuddy < MAX_BUDDY && coins >= buddyPrice;

  const buyLife = () => {
    if (!canBuyLife) return;
    setCoins(v => v - lifePrice);
    setBoughtLives(v => v + 1);
  };

  const buyBuddy = () => {
    if (!canBuyBuddy) return;
    setCoins(v => v - buddyPrice);
    setBoughtBuddy(v => v + 1);
  };

  const handlePlay = () => {
    navigate('/final-intro', {
      state: {
        lives:      totalLives,
        buddyCount: totalBuddy,
      },
    });
  };

  return (
    <PageLayout>
      <div className="pt-6 flex flex-col gap-4 pb-4">

        {/* Seller */}
        <div className="flex justify-center">
          <img src="/shop/capybara_item.png" alt={t.shopSellerAlt} style={{ height: '80px', objectFit: 'contain' }} />
        </div>

        <p className="text-sm" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
          {t.spendCoinsForFinalGame}
        </p>

        {/* Coins */}
        <div className="rounded-2xl p-5 flex flex-col items-center gap-1"
          style={{ backgroundColor: '#FEF3E2' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{t.yourCoins}</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>🪙 {coins}</p>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-3">

            {/* Extra Life — hidden in easy mode */}
          {!isEasy && (
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}>
              <span className="text-3xl shrink-0">❤️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{t.extraLife}</p>
                <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.5' }}>{t.extraLifeDesc}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--color-primary)' }}>
                  {translate(t.livesProgress, { current: totalLives, max: MAX_LIVES })}
                </p>
                <p className="text-sm font-bold mt-0.5" style={{ color: '#CA8A04' }}>🪙 {lifePrice}</p>
              </div>
              <button
                onClick={buyLife}
                disabled={!canBuyLife}
                className="rounded-xl px-4 py-2 text-sm font-bold shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
              >
                {t.buy}
              </button>
            </div>
          )}

          {/* Bridge Buddy */}
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}>
            <span className="text-3xl shrink-0">🌉</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{t.bridgeBuddy}</p>
              <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.5' }}>{t.bridgeBuddyDesc}</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--color-primary)' }}>
                {translate(t.usesProgress, { current: totalBuddy, max: MAX_BUDDY + BASE_BUDDY })}
              </p>
              <p className="text-sm font-bold mt-0.5" style={{ color: '#CA8A04' }}>🪙 {buddyPrice}</p>
            </div>
            <button
              onClick={buyBuddy}
              disabled={!canBuyBuddy}
              className="rounded-xl px-4 py-2 text-sm font-bold shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              {t.buy}
            </button>
          </div>

        </div>

        <Button variant="green" onClick={handlePlay}>{t.playFinalGame}</Button>

      </div>
    </PageLayout>
  );
}