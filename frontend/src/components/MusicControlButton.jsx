import React from 'react';

export default function MusicControlButton({ isMusicPlaying, toggleMusic }) {
  return (
    <button
      onClick={toggleMusic}
      className="fixed top-4 left-4 z-[9999] bg-white/90 hover:bg-white backdrop-blur-md rounded-full p-3 shadow-lg transition-all duration-200"
      title={isMusicPlaying ? "Pause Music" : "Play Music"}
    >
      {isMusicPlaying ? (
        <svg className="w-6 h-6 text-banana-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-banana-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}
