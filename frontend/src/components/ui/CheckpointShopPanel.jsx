import { useEffect, useRef, useState } from 'react';
import {
  addCoinsToProgress,
  buyCheckpointItem,
  getPlayerProgress,
  SHOP_ITEMS,
} from '../../utils/checkpointShop';
import Button from './Button';
import Card from './card';

export default function CheckpointShopPanel({
  earnedCoins = 0,
  grantCoins = false,
  isOpen = false,
  warningMessage = '',
  onPurchase,
}) {
  const [coins, setCoins] = useState(() => {
    const baseCoins = getPlayerProgress().coins ?? 0;
    return grantCoins ? baseCoins + earnedCoins : baseCoins;
  });
  const [message, setMessage] = useState('');
  const [purchasedItems, setPurchasedItems] = useState({});
  const coinsGrantedRef = useRef(false);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen || wasOpenRef.current) {
      wasOpenRef.current = isOpen;
      return;
    }

    coinsGrantedRef.current = false;
    setPurchasedItems({});
    setMessage('');
    const baseCoins = getPlayerProgress().coins ?? 0;
    setCoins(grantCoins ? baseCoins + earnedCoins : baseCoins);
    wasOpenRef.current = true;
  }, [earnedCoins, grantCoins, isOpen]);

  useEffect(() => {
    if (!grantCoins || earnedCoins <= 0 || coinsGrantedRef.current) return;
    coinsGrantedRef.current = true;
    const updated = addCoinsToProgress(earnedCoins);
    setCoins(updated.coins ?? 0);
  }, [earnedCoins, grantCoins]);

  const handleBuy = (itemId) => {
    if (purchasedItems[itemId]) return;

    const result = buyCheckpointItem(itemId);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setCoins(result.progress.coins ?? 0);
    setPurchasedItems((current) => ({
      ...current,
      [itemId]: true,
    }));
    setMessage('Purchased. It will apply automatically on your next game.');
    onPurchase?.(result);
  };

  return (
    <div className="w-full rounded-2xl p-4 mt-2" style={{ backgroundColor: '#FFF7ED' }}>
      {warningMessage && (
        <p className="text-xs font-bold text-center mb-3" style={{ color: 'var(--color-red)' }}>
          {warningMessage}
        </p>
      )}
      <p className="text-sm font-bold text-center" style={{ color: 'var(--color-primary)' }}>
        Your coins
      </p>
      <p className="text-2xl font-bold mt-1 text-center" style={{ color: 'var(--color-primary)' }}>
        Coins {coins}
      </p>

      <p className="text-sm mt-3" style={{ color: 'var(--color-subtext)', lineHeight: '1.6' }}>
        Use your coins to buy power-ups for upcoming rounds
      </p>

      <div className="flex flex-col gap-3 mt-4">
        {SHOP_ITEMS.map((item) => (
          <Card
            key={item.id}
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
     
          >
            <div className="shrink-0 flex items-center justify-center" style={{ width: 40, height: 40 }}>
              {item.img
                ? <img src={item.img} className="w-10 h-10 object-contain" alt={item.label} />
                : <span className="text-3xl">{item.emoji}</span>}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{item.label}</p>
              <p className="text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.5' }}>{item.desc}</p>
              <p className="text-sm font-bold mt-1" style={{ color: '#CA8A04' }}>Coins {item.price}</p>
            </div>
            <button
              onClick={() => handleBuy(item.id)}
              disabled={coins < item.price || !!purchasedItems[item.id]}
              className="rounded-xl px-4 py-2 text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              style={{
                backgroundColor: purchasedItems[item.id] ? '#9CA3AF' : 'var(--color-primary)',
                color: 'white',
              }}
            >
              {purchasedItems[item.id] ? 'Purchased' : 'Buy'}
            </button>
          </Card>
        ))}
      </div>

      {message && (
        <p className="text-xs font-semibold mt-3 text-center" style={{ color: 'var(--color-primary)' }}>
          {message}
        </p>
      )}
    </div>
  );
}
