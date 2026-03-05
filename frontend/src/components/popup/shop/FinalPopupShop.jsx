import React, { useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Overlayer from '../Overlayer';
import Heading from '@/components/ui/Heading';

const DEFAULT_LENGTH = 10;
const DEFAULT_SPEED = 120;

const finalShopItems = [
  {
    id: 'slow',
    name: 'Slow Down',
    image: '/games/finalGame/slower.png',
    price: 60,
    description: 'Reduce the snake speed in SneakGame, making it easier to control.',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'shorten',
    name: 'Shorten Snake',
    image: '/games/finalGame/shorter.png',
    price: 60,
    description: 'Reduce the initial length of the snake in SneakGame, making it easier to dodge.',
    bgColor: 'bg-green-100',
  },
];

export default function FinalPopupShop({ isOpen = true, onClose, onPurchase, getStats }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [slowScore, setSlowScore] = useState(0);
  const [quantities, setQuantities] = useState({ slow: 0, shorten: 0 });
  const [inputQty, setInputQty] = useState(1);

  const handleItemClick = (item) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
    setInputQty(1);
  };

  const handleBuy = () => {
    if (!selectedItem) return;
    const qty = Math.max(1, parseInt(inputQty) || 1);
    if (selectedItem.id === 'shorten' && length > 3) {
      const maxQty = Math.min(qty, length - 3);
      setLength(l => l - maxQty);
      setQuantities(q => ({ ...q, shorten: q.shorten + maxQty }));
    }
    if (selectedItem.id === 'slow') {
      setSlowScore(s => s + qty);
      setQuantities(q => ({ ...q, slow: q.slow + qty }));
    }
    if (onPurchase) onPurchase(selectedItem, qty);
    setSelectedItem(null);
    setInputQty(1);
  };

  const handleClose = () => {
    setSelectedItem(null);
    // Each slowScore increases the interval by 10ms
    const interval = DEFAULT_SPEED + slowScore * 10;
    if (getStats) getStats(length, interval);
    onClose && onClose();
  };

  return (
    <Overlayer isOpen={isOpen} onClose={handleClose}>
      <Card variant="glass" className="w-full max-w-lg">
        <CardContent variant="glass">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Heading icon={ShoppingBag} align="left" className="text-orange-600">
              SneakGame Item Shop
            </Heading>
          </div>
          {/* Shopkeeper */}
          <div className="text-center">
            <img 
              src="/shop/seller.gif" 
              alt="Capybara shopkeeper" 
              className="w-32 object-cover rounded-lg mx-auto mb-2" 
            />
            <p className="text-sm text-gray-600 font-cute-text">
              {selectedItem 
                ? "🛒 Great choice! Click Buy to purchase!" 
                : "🛍️ Welcome to the SneakGame shop! Select an item to see details."}
            </p>
          </div>

          {/* Current stats */}
          <div className="mb-4 w-full flex flex-col items-center">
            <div className="text-base font-semibold">Current Snake Length: <span className="text-cute-pink">{length}</span></div>
            <div className="text-base font-semibold">Current Slow Score: <span className="text-cute-pink">{slowScore}</span></div>
          </div>

          {/* Shop Items Grid */}
          <div className="grid grid-cols-2 gap-4 my-6">
            {finalShopItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-center flex flex-col items-center justify-center ${
                    isSelected 
                      ? 'bg-banana-green-50 shadow-lg bg-green-400' 
                      : 'border-gray-200 bg-white hover:border-banana-green-300'
                  }`}
                >
                  <div className={`w-20 rounded-lg flex items-center justify-center mb-3 ${item.bgColor}`}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 object-contain mx-auto"
                    />
                  </div>
                  <h3 className="font-bold font-cute-text text-gray-800 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-orange-600 font-bold">
                    💰 {item.price} coins
                  </p>
                  <div className="text-xs mt-1">Purchased: <span className="font-bold">{quantities[item.id]}</span></div>
                </button>
              );
            })}
          </div>

          {/* Item Description */}
          {selectedItem && (
            <div className="bg-white/80 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-banana-green-700 font-cute-text mb-2">
                {selectedItem.name} Details:
              </h3>
              <p className="text-gray-700 mb-3">
                {selectedItem.description}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <label htmlFor="qty-input" className="text-sm font-semibold">Quantity:</label>
                <input
                  id="qty-input"
                  type="number"
                  min={1}
                  value={inputQty}
                  onChange={e => setInputQty(e.target.value)}
                  className="w-16 px-2 py-1 border rounded text-center focus:outline-cute-pink"
                />
              </div>
              <div className="text-center">
                <Button 
                  variant="banana" 
                  onClick={handleBuy}
                  className="w-full"
                  disabled={
                    (selectedItem.id === 'shorten' && length - (parseInt(inputQty) || 1) < 3) ||
                    (selectedItem.id === 'slow' && (DEFAULT_SPEED + (slowScore + (parseInt(inputQty) || 1)) * 10) < 60)
                  }
                >
                  {`💰 Buy ${inputQty} for ${selectedItem.price * (parseInt(inputQty) || 1)} coins`}
                </Button>
              </div>
            </div>
          )}
          {/* Continue Button */}
          <div className="mt-2 flex justify-center">
            <Button 
              variant="banana" 
              onClick={handleClose}
              className="w-40 text-lg font-cute-text"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </Overlayer>
  );
}
