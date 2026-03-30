// ── Mini-game difficulty config ────────────────────────────────
// timeLimit: seconds the player has to complete the game
// goal:      target score / rounds / floors needed to win

export const MINI_GAME_CONFIG = {
  memory: {
    easy:   { timeLimit: 150 },
    normal: { timeLimit: 120 },
    hard:   { timeLimit:  90 },
  },
  whackAMole: {
    easy:   { timeLimit: 150, goal: 4 },
    normal: { timeLimit: 120, goal: 6 },
    hard:   { timeLimit:  90, goal: 8 },
  },
  simon: {
    easy:   { timeLimit: 180, goal: 4 },
    normal: { timeLimit: 120, goal: 5 },
    hard:   { timeLimit:  90, goal: 7 },
  },
  puzzle: {
    easy:   { timeLimit: 150 },
    normal: { timeLimit: 100 },
    hard:   { timeLimit:  70 },
  },
  tower: {
    easy:   { timeLimit: 240, goal: 5 },
    normal: { timeLimit: 180, goal: 8 },
    hard:   { timeLimit: 120, goal: 11 },
  },
  wordQuiz: {
    easy:   { timeLimit: 180, goal: 3 },
    normal: { timeLimit: 180, goal: 5 },
    hard:   { timeLimit: 150, goal: 8 },
  },
};

/** Returns config for a given game + difficulty. Falls back to 'hard' if unknown. */
export function getMiniGameConfig(game, difficulty) {
  return MINI_GAME_CONFIG[game]?.[difficulty] ?? MINI_GAME_CONFIG[game]?.hard;
}

/** Reads difficulty from the current session in localStorage. */
export function getSessionDifficulty() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    return session?.difficulty || 'hard';
  } catch {
    return 'hard';
  }
}
