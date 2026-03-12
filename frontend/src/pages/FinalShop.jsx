import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';

const ALL_ITEMS = [
  { id: 'auto',       emoji: '⚔️',  label: 'Auto slice',        desc: 'Will cut the specific number fruit',      price: 150 },
  { id: 'slow',       emoji: '⏰',  label: 'Slow Motion',        desc: 'Slow drop speed',                         price: 150 },
  { id: 'life',       emoji: '❤️',  label: 'Extra life',         desc: "One mistake won't count against you",     price: 200 },
  { id: 'score',      emoji: '📊',  label: 'Score Multiplier',   desc: '1.5x score for your next game',           price: 350 },
];

export default function FinalShop() {
  const navigate = useNavigate();
  const location = useLocation();
  const baseCoins = location.state?.coins ?? 800;

  const [coins, setCoins] = useState(baseCoins);
  const [items, setItems] = useState(ALL_ITEMS);
  const [bought, setBought] = useState([]);

  const handleBuy = (item) => {
    if (coins < item.price) return;
    setCoins(v => v - item.price);
    setItems(v => v.filter(i => i.id !== item.id));
    setBought(v => [...v, item]);
  };

  return (
    <PageLayout>
      <div className="pt-6 flex flex-col gap-4 pb-4">

        {/* Description */}
        <p className="text-sm" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
          Use your all coins for power-ups for final game.
        </p>

        {/* Coins balance */}
        <div className="rounded-2xl p-5 flex flex-col items-center gap-1"
          style={{ backgroundColor: '#FEF3E2' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Your coins</p>
          <p className="text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
            🪙 {coins}
          </p>
        </div>

        {/* Items list */}
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
              <span className="text-3xl shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{item.label}</p>
                <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.5' }}>{item.desc}</p>
                <p className="text-sm font-bold mt-1" style={{ color: '#CA8A04' }}>🪙 {item.price}</p>
              </div>
              <button
                onClick={() => handleBuy(item)}
                disabled={coins < item.price}
                className="rounded-xl px-4 py-2 text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
              >
                Buy
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-center text-sm py-4" style={{ color: 'var(--color-subtext)' }}>
              All items purchased!
            </p>
          )}
        </div>

        {/* Info box */}
        <div className="rounded-xl p-4 flex gap-3"
          style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
          <Info size={16} style={{ color: '#3B82F6', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>Important</p>
            <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
              Items purchased here will help you in the next mini games. Purchase items here won't affect your final game!
            </p>
          </div>
        </div>

        {/* Play button */}
        <Button variant="green" onClick={() => navigate('/final-challenge', { state: { powerUps: bought } })}>
          ▶ Play final game
        </Button>

      </div>
    </PageLayout>
  );
}
