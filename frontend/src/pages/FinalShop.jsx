import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';

const BASE_LIVES = 1;
const MAX_LIVES   = 6;

const ONE_TIME = [
  {
    id: 'x3score',
    emoji: '⭐',
    label: 'Triple Score',
    desc: 'Perfect hits give ×3 score instead of ×2.',
    price: 250,
  },
  {
    id: 'helper',
    emoji: '🌉',
    label: 'Bridge Buddy',
    desc: 'Small distance errors are forgiven — close enough counts!',
    price: 300,
  },
];

const LIFE_ITEM = {
  id: 'life',
  emoji: '❤️',
  label: 'Extra Life',
  desc: 'Start with one more life.',
  price: 80,
};

export default function FinalShop() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const baseCoins   = location.state?.coins ?? 800;

  const [coins, setCoins]           = useState(baseCoins);
  const [boughtLives, setBoughtLives] = useState(0);
  const [boughtOneTime, setBoughtOneTime] = useState([]);

  const totalLives = BASE_LIVES + boughtLives;
  const canBuyLife = totalLives < MAX_LIVES && coins >= LIFE_ITEM.price;

  const buyLife = () => {
    if (!canBuyLife) return;
    setCoins(v => v - LIFE_ITEM.price);
    setBoughtLives(v => v + 1);
  };

  const buyOneTime = (item) => {
    if (boughtOneTime.includes(item.id) || coins < item.price) return;
    setCoins(v => v - item.price);
    setBoughtOneTime(v => [...v, item.id]);
  };

  const handlePlay = () => {
    navigate('/final-challenge', {
      state: {
        lives:   totalLives,
        x3score: boughtOneTime.includes('x3score'),
        helper:  boughtOneTime.includes('helper'),
      },
    });
  };

  return (
    <PageLayout>
      <div className="pt-6 flex flex-col gap-4 pb-4">

        {/* Seller */}
        <div className="flex justify-center">
          <img src="/shop/seller.gif" alt="Shop seller" style={{ height: '80px', objectFit: 'contain' }} />
        </div>

        <p className="text-sm" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
          Spend your coins on power-ups for the final game!
        </p>

        {/* Coins */}
        <div className="rounded-2xl p-5 flex flex-col items-center gap-1"
          style={{ backgroundColor: '#FEF3E2' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Your coins</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>🪙 {coins}</p>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-3">

          {/* Life — multi-buy */}
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}>
            <span className="text-3xl shrink-0">❤️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{LIFE_ITEM.label}</p>
              <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.5' }}>{LIFE_ITEM.desc}</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--color-primary)' }}>
                Lives: {totalLives} / {MAX_LIVES}
              </p>
              <p className="text-sm font-bold mt-0.5" style={{ color: '#CA8A04' }}>🪙 {LIFE_ITEM.price}</p>
            </div>
            <button
              onClick={buyLife}
              disabled={!canBuyLife}
              className="rounded-xl px-4 py-2 text-sm font-bold shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              Buy
            </button>
          </div>

          {/* One-time items */}
          {ONE_TIME.map(item => {
            const owned = boughtOneTime.includes(item.id);
            return (
              <div key={item.id}
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}>
                <span className="text-3xl shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.5' }}>{item.desc}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: '#CA8A04' }}>🪙 {item.price}</p>
                </div>
                <button
                  onClick={() => buyOneTime(item)}
                  disabled={owned || coins < item.price}
                  className="rounded-xl px-4 py-2 text-sm font-bold shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: owned ? '#22C55E' : 'var(--color-primary)', color: 'white' }}
                >
                  {owned ? '✓' : 'Buy'}
                </button>
              </div>
            );
          })}
        </div>

        <Button variant="green" onClick={handlePlay}>▶ Play final game</Button>

      </div>
    </PageLayout>
  );
}
