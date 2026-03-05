import React, { useRef, useEffect, useState } from 'react';
import Overlayer from '../../popup/Overlayer';

// Constants for the game
const GRID_SIZE = 14;
const INITIAL_DIRECTION = { x: 1, y: 0 };

function getInitialSnake(length) {
  // Start horizontally in the middle
  const startY = Math.floor(GRID_SIZE / 2);
  const startX = Math.floor(GRID_SIZE / 2);
  return Array.from({ length }, (_, i) => ({ x: startX - i, y: startY }));
}

function getRandomFood(snake) {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
  return newFood;
}

export default function SneakGame({ onClose, avatar, length = 10, speed = 120 }) {
  const [snake, setSnake] = useState(() => getInitialSnake(length));
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(() => getRandomFood(getInitialSnake(length)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const moveRef = useRef();
  const dirRef = useRef(direction);
  const touchStart = useRef(null);

  // Handle keyboard and swipe
  useEffect(() => {
    const handleKey = e => {
      if (e.key === 'ArrowUp' && dirRef.current.y !== 1) setDirection({ x: 0, y: -1 });
      if (e.key === 'ArrowDown' && dirRef.current.y !== -1) setDirection({ x: 0, y: 1 });
      if (e.key === 'ArrowLeft' && dirRef.current.x !== 1) setDirection({ x: -1, y: 0 });
      if (e.key === 'ArrowRight' && dirRef.current.x !== -1) setDirection({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Touch swipe for mobile
  const handleTouchStart = e => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = e => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20 && dirRef.current.x !== -1) setDirection({ x: 1, y: 0 });
      if (dx < -20 && dirRef.current.x !== 1) setDirection({ x: -1, y: 0 });
    } else {
      if (dy > 20 && dirRef.current.y !== -1) setDirection({ x: 0, y: 1 });
      if (dy < -20 && dirRef.current.y !== 1) setDirection({ x: 0, y: -1 });
    }
    touchStart.current = null;
  };

  // Main game loop
  useEffect(() => {
    if (gameOver) return;
    dirRef.current = direction;
    // Lower speed value = slower snake (speed is ms per move)
    const interval = Math.max(20, speed);
    moveRef.current = setTimeout(() => {
      setSnake(prev => {
        const newHead = {
          x: (prev[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
          y: (prev[0].y + direction.y + GRID_SIZE) % GRID_SIZE
        };
        // Check collision
        if (prev.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }
        let newSnake = [newHead, ...prev];
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(getRandomFood(newSnake));
          setScore(s => s + 1);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, interval);
    return () => clearTimeout(moveRef.current);
  }, [snake, direction, food, gameOver, speed]);

  // Auto-close after game over
  useEffect(() => {
    if (gameOver) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameOver, onClose]);

  // Restart game
  const restart = () => {
    const newSnake = getInitialSnake(length);
    setSnake(newSnake);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFood(newSnake));
    setScore(0);
    setGameOver(false);
  };

  // Responsive board size
  const [boardSize, setBoardSize] = useState(0);
  useEffect(() => {
    const updateSize = () => {
      const min = Math.min(window.innerWidth, window.innerHeight * 0.85);
      setBoardSize(Math.max(420, Math.floor(min)));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <Overlayer isOpen={true} onClose={onClose} closeOnOverlayClick={true}>
      <div
        className="flex items-center justify-center w-full h-full"
        style={{ minHeight: '100vh' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-white rounded-xl p-2 shadow-lg flex flex-col items-center w-full max-w-3xl" style={{ maxHeight: '98vh' }}>
          <div className="flex w-full justify-between items-center mb-2 px-2">
            <span className="font-bold text-lg">Sneak Game</span>
            <button onClick={onClose} className="text-red-500 font-bold text-xl">×</button>
          </div>
          <div className="mb-2">Score: <span className="font-bold text-cute-pink">{score}</span></div>
          <div
            className="relative bg-gray-100 border rounded-lg"
            style={{ width: boardSize, height: boardSize, touchAction: 'none', maxHeight: '98vh', maxWidth: '98vw' }}
          >
            {/* Snake */}
            {snake.map((seg, i) => (
              i === 0 ? (
                <img
                  key={i}
                  src={avatar || '/avatar1.png'}
                  alt="avatar"
                  className="absolute rounded-full border-2 border-cute-pink"
                  style={{
                    left: seg.x * (boardSize / GRID_SIZE) - (boardSize / GRID_SIZE) * 0.25,
                    top: seg.y * (boardSize / GRID_SIZE) - (boardSize / GRID_SIZE) * 0.25,
                    width: (boardSize / GRID_SIZE) * 1.5,
                    height: (boardSize / GRID_SIZE) * 1.5,
                    zIndex: 2,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  key={i}
                  className="absolute rounded bg-green-500"
                  style={{
                    left: seg.x * (boardSize / GRID_SIZE),
                    top: seg.y * (boardSize / GRID_SIZE),
                    width: boardSize / GRID_SIZE,
                    height: boardSize / GRID_SIZE,
                    zIndex: 1
                  }}
                />
              )
            ))}
            {/* Food */}
            <div
              className="absolute bg-yellow-400 rounded-full border border-yellow-600"
              style={{
                left: food.x * (boardSize / GRID_SIZE) + (boardSize / GRID_SIZE) * 0.125,
                top: food.y * (boardSize / GRID_SIZE) + (boardSize / GRID_SIZE) * 0.125,
                width: (boardSize / GRID_SIZE) * 0.75,
                height: (boardSize / GRID_SIZE) * 0.75,
                zIndex: 3
              }}
            />
          </div>
          {gameOver && (
            <div className="mt-3 text-center">
              <div className="text-red-500 font-bold mb-2">Game Over!</div>
            </div>
          )}
        </div>
      </div>
    </Overlayer>
  );
}
