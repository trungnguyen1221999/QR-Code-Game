import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import { SHOP_ITEMS, getItemPrice } from '../utils/checkpointShop';
import { useLanguage } from '../context/LanguageContext';
import { translate } from '../translations';

const COINS_EARNED = 30;

export default function PlayerShop() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state ?? {};
  const checkpoint = state.checkpoint ?? 1;
  const baseCoins = state.coins ?? 1000;

  const [coins, setCoins] = useState(baseCoins + COINS_EARNED);
  const [items, setItems] = useState(SHOP_ITEMS);
  const [bought, setBought] = useState([]);

  const handleBuy = (item) => {
    const price = getItemPrice(item, checkpoint);
    if (coins < price) return;
    setCoins(v => v - price);
    setBought(v => [...v, item.id]);
    setItems(v => v.filter(i => i.id !== item.id));
  };

  return (
    <PageLayout>
      <div className="pt-4 flex flex-col gap-4 pb-4">

       
        {/* Victory header */}
        <div className="flex flex-col items-center gap-1 pt-2">
          <span className="text-5xl">🏆</span>
          <div className="flex gap-1 text-2xl">⭐⭐⭐</div>
          <p className="text-lg font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
            {t.playerShopVictory}
          </p>
          <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            {t.playerShopCheckpointPassed}
          </p>
          <p className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>
            {translate(t.playerShopCoinsEarned, { coins: COINS_EARNED })}
          </p>
        </div>

         {/* Seller GIF */}
        <div className="flex justify-center">
          <img src="/shop/seller.gif" alt={t.shopSellerAlt} style={{ height: '80px', objectFit: 'contain' }} />
        </div>

        {/* Divider + desc */}
        <div style={{ borderTop: '1px solid var(--color-border)' }} />
        <p className="text-sm" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
          {t.shopPowerUpsUpcoming}
        </p>

        {/* Coins balance */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
            {t.yourCoinsLabel}
          </span>
          <span className="text-2xl font-bold flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
            🪙 {coins}
          </span>
        </div>

        {/* Items list */}
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}>
              <div className="shrink-0 flex items-center justify-center" style={{ width: '40px', height: '40px' }}>
                {item.img
                  ? <img src={item.img} className="w-10 h-10 object-contain" alt={item.label} />
                  : <span className="text-3xl">{item.emoji}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{item.label}</p>
                <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.5' }}>{item.desc}</p>
                <p className="text-sm font-bold mt-1" style={{ color: '#CA8A04' }}>🪙 {getItemPrice(item, checkpoint)}</p>
              </div>
              <button
                onClick={() => handleBuy(item)}
                disabled={coins < getItemPrice(item, checkpoint)}
                className="rounded-xl px-4 py-2 text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
              >
                {t.buy}
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-center text-sm py-4" style={{ color: 'var(--color-subtext)' }}>
              {t.playerShopAllItemsPurchased}
            </p>
          )}
        </div>

        {/* Continue */}
        <Button
          variant="green"
          onClick={() => navigate('/game', { state: { justCompleted: checkpoint, coins } })}
        >
          {t.done}
        </Button>

      </div>
    </PageLayout>
  );
}