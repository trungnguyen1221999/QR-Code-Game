import React, { useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Overlayer from '../Overlayer';
import Heading from '@/components/ui/Heading';

const PopupShop = ({ isOpen = true, onClose}) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const shopItems = [
    {
      id: 'luck',
      name: 'Lucky Item',
      image: '/shop/luck.png',
      price: 50,
      description: 'Receive a random lucky item to help in your journey!',
      bgColor: 'bg-yellow-100'
    },
    {
      id: 'x2time',
      name: 'Double Time',
      image: '/shop/x2time.png',
      price: 75,
      description: 'Get 2x extra time for your next challenge!',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'x2score',
      name: 'Money Boost',
      image: '/shop/x2money.png',
      price: 80,
      description: 'Earn 2x money for your next challenge!',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'hint',
      name: 'Hint Helper',
      image: '/shop/hint.png',
      price: 30,
      description: 'Get a helpful hint for your next question!',
      bgColor: 'bg-green-100'
    }
  ];

  const handleItemClick = (item) => {
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handlePurchase = () => {
    if (!selectedItem) return;
  };

  const handleClose = () => {
    setSelectedItem(null);
    onClose();
  };

  return (
    <Overlayer isOpen={isOpen} onClose={handleClose}>
      <Card variant="glass" className="w-full max-w-lg">
        <CardContent variant="glass">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Heading icon={ShoppingBag} align="left" className="text-orange-600">
              Capybara Shop
            </Heading>
          </div>
        {/* Capybara Shopkeeper */}
          <div className="text-center">
            <img 
              src="/capy.gif" 
              alt="Capybara shopkeeper" 
              className="w-16 h-16 object-cover rounded-lg mx-auto mb-2" 
            />
            <p className="text-sm text-gray-600 font-cute-text">
              {selectedItem 
                ? "🛒 Great choice! Click Buy to purchase!" 
                : "🛍️ Welcome to my shop! Select an item to see details."}
            </p>
          </div>

          {/* Shop Items Grid */}
          <div className="grid grid-cols-2 gap-4 my-6">
            {shopItems.map((item) => {
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
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${item.bgColor}`}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-10 object-contain mx-auto"
                    />
                  </div>
                  <h3 className="font-bold font-cute-text text-gray-800 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-orange-600 font-bold">
                    💰 {item.price} coins
                  </p>
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
              <div className="text-center">
                <Button 
                  variant="banana" 
                  onClick={handlePurchase}
                  className="w-full"
                >
                  {
                    `💰 Buy for ${selectedItem.price} coins`
                    
                  }
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Overlayer>
  );
};

export default PopupShop;