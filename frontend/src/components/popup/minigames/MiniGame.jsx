import React, { useState } from 'react';
import { Brain, X, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Overlayer from '../Overlayer';
import Heading from '@/components/ui/Heading';
import PopupShop from '../shop/PopupShop';
import toast from 'react-hot-toast';

const MiniGame = ({ isOpen = true, onClose }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showShop, setShowShop] = useState(false);

  // Sample question data
  const question = {
    text: "What animal is a Capybara?",
    answers: [
      { id: 1, text: "Semi-aquatic rodent", correct: true },
      { id: 2, text: "Wild boar", correct: false },
      { id: 3, text: "Giant rabbit", correct: false },
      { id: 4, text: "Prairie dog", correct: false }
    ]
  };

  const handleAnswerSelect = (answerId) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerId);
    setIsAnswered(true);

    const selectedAnswerObj = question.answers.find(a => a.id === answerId);
    
    if (selectedAnswerObj.correct) {
      toast.success('🎉 Correct! +50 points!', {
        duration: 2000,
        position: 'top-center',
      });
    } else {
      toast.error('❌ Wrong answer! Try again next time.', {
        duration: 2000,
        position: 'top-center',
      });
    }

    // Auto close after 3 seconds
    setTimeout(() => {
      if (selectedAnswerObj.correct) {
        // Show shop if answer is correct
        setShowShop(true);
      } else {
        // Close directly if wrong
        handleClose();
      }
    }, 3000);
  };

  const handleClose = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowShop(false);
    onClose();
  };

  const handleShopClose = () => {
    setShowShop(false);
    handleClose();
  };

  // Show shop if game completed successfully
  if (showShop) {
    return (
      <PopupShop 
        isOpen={showShop}
        onClose={handleShopClose}
        playerCoins={150} // Sample coins
      />
    );
  }

  const getAnswerButtonClass = (answer) => {
    if (!isAnswered) {
      return "bg-white hover:bg-banana-green-50 text-gray-700 border border-gray-200";
    }

    if (answer.correct) {
      return "bg-green-500 text-white border border-green-600";
    }

    if (answer.id === selectedAnswer && !answer.correct) {
      return "bg-red-500 text-white border border-red-600";
    }

    return "bg-gray-100 text-gray-500 border border-gray-200";
  };

  return (
    <Overlayer isOpen={isOpen} onClose={handleClose}>
      <Card variant="glass" className="w-full max-w-lg">
        <CardContent variant="glass">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Heading icon={Brain} align="left" className="text-purple-600">
              Mini Game Challenge
            </Heading>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-red-500 hover:bg-red-100"
              onClick={handleClose}
            >
              <X size={20} />
            </Button>
          </div>

          {/* Question */}
          <div className="mb-6">
            <div className="bg-white/80 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-bold text-banana-green-700 font-cute-text mb-2">
                Question:
              </h3>
              <p className="text-gray-700 font-medium">
                {question.text}
              </p>
            </div>

            {/* Capybara GIF */}
            <div className="text-center mb-4">
              <img 
                src="/capy.gif" 
                alt="Capybara thinking" 
                className="w-24 h-24 object-cover rounded-lg mx-auto" 
              />
              <p className="text-sm text-gray-600 mt-2 font-cute-text">
                🤔 Think carefully! 🤔
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {question.answers.map((answer) => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  disabled={isAnswered}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 font-medium ${getAnswerButtonClass(answer)}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{answer.text}</span>
                    {isAnswered && answer.correct && (
                      <Check size={20} className="text-white" />
                    )}
                    {isAnswered && answer.id === selectedAnswer && !answer.correct && (
                      <AlertCircle size={20} className="text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Result Message */}
          {isAnswered && (
            <div className="text-center">
              <p className="text-sm text-gray-600 font-cute-text">
                {selectedAnswer && question.answers.find(a => a.id === selectedAnswer)?.correct 
                  ? "🎉 Great job! Closing in 3 seconds..." 
                  : "💪 Better luck next time! Closing in 3 seconds..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Overlayer>
  );
};

export default MiniGame;