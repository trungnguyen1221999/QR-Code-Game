import { useEffect, useRef, useState } from 'react';
import {
  addCoinsToProgress,
  buyCheckpointItem,
  getItemPrice,
  getPlayerProgress,
  SHOP_ITEMS,
} from '../../utils/checkpointShop';
import { isFinalCheckpointClear } from '../../utils/finalCheckpointFlow';
import Card from './Card';

export default function CheckpointShopPanel({
  earnedCoins = 0,
  grantCoins = false,
  isOpen = false,
  warningMessage = '',
  onPurchase,
  checkpoint = 1,
}) {
  const [coins, setCoins] = useState(() => {
    const baseCoins = getPlayerProgress().coins ?? 0;
    return grantCoins ? baseCoins + earnedCoins : baseCoins;
  });
  const [message, setMessage] = useState('');
  const [purchasedItems, setPurchasedItems] = useState({});
  const coinsGrantedRef = useRef(false);
  const wasOpenRef = useRef(false);
  const finalCheckpointCleared = isFinalCheckpointClear(checkpoint);

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

    const result = buyCheckpointItem(itemId, checkpoint);
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

  if (finalCheckpointCleared) {
    return null;
  }

  return (
    <div className="w-full rounded-2xl p-3 mt-2" style={{ backgroundColor: '#FFF7ED' }}>
      {warningMessage && (
        <p className="text-[11px] font-bold text-center mb-2" style={{ color: 'var(--color-red)' }}>
          {warningMessage}
        </p>
      )}
      <p className="text-xs sm:text-sm font-bold text-center" style={{ color: 'var(--color-primary)' }}>
        Your coins
      </p>
      <p className="text-xl sm:text-2xl font-bold mt-1 text-center" style={{ color: 'var(--color-primary)' }}>
        Coins {coins}
      </p>

      <p className="text-xs sm:text-sm mt-2 sm:mt-3" style={{ color: 'var(--color-subtext)', lineHeight: '1.5' }}>
        Use your coins to buy power-ups for upcoming rounds
      </p>

      <div className="flex flex-col gap-2 mt-3">
        {SHOP_ITEMS.filter((item) => !(item.id === 'life' && getPlayerProgress().life === Infinity)).map((item) => (
          <Card
            key={item.id}
            className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
     
          >
            <div className="shrink-0 flex items-center justify-center" style={{ width: 34, height: 34 }}>
              {item.img
                ? <img src={item.img} className="w-8 h-8 object-contain" alt={item.label} />
                : <span className="text-2xl">{item.emoji}</span>}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--color-text)' }}>{item.label}</p>
              <p className="text-[11px] sm:text-xs" style={{ color: 'var(--color-subtext)', lineHeight: '1.35' }}>{item.desc}</p>
              <p className="text-xs sm:text-sm font-bold mt-1" style={{ color: '#CA8A04' }}>Coins {getItemPrice(item, checkpoint)}</p>
            </div>
            <button
              onClick={() => handleBuy(item.id)}
              disabled={coins < getItemPrice(item, checkpoint) || !!purchasedItems[item.id]}
              className="rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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
        <p className="text-[11px] sm:text-xs font-semibold mt-2 text-center" style={{ color: 'var(--color-primary)' }}>
          {message}
        </p>
      )}
    </div>
  );
}
