export const SHOP_ITEMS = [
  {
    id: 'time',
    emoji: '⏱️',
    img: '/shop/x2time.png',
    label: 'Time Boost',
    desc: 'Extend the next game time limit by 10 seconds',
    basePrice: 200,
  },
  {
    id: 'life',
    emoji: '❤️',
    img: null,
    label: 'Extra Life',
    desc: 'Add one more life to your player',
    basePrice: 200,
  },
];

export function getItemPrice(item, checkpoint = 1) {
  return item.basePrice * checkpoint;
}

const PLAYER_PROGRESS_KEY = 'playerGameProgress';
const PLAYER_POWERUPS_KEY = 'playerGamePowerups';
export const DEFAULT_PROGRESS = { completed: 0, current: 1, life: 3, coins: 0 };
const DEFAULT_POWERUPS = { timeBoost: 0, extraLife: 0 };

function readJson(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getPlayerProgress() {
  return readJson(PLAYER_PROGRESS_KEY, DEFAULT_PROGRESS);
}

export function setPlayerProgress(progress) {
  writeJson(PLAYER_PROGRESS_KEY, progress);
}

export function applyLossToStoredProgress() {
  const progress = getPlayerProgress();
  const nextLife = Math.max(0, (progress.life ?? DEFAULT_PROGRESS.life) - 1);
  const updated = { ...progress, life: nextLife };
  const powerups = getStoredPowerups();

  if ((powerups.extraLife ?? 0) > 0) {
    setStoredPowerups({ ...powerups, extraLife: powerups.extraLife - 1 });
  }

  setPlayerProgress(updated);

  return {
    remainingLives: nextLife,
    needsLifePurchase: nextLife === 0,
  };
}

export function resetProgressToCheckpointOne() {
  const reset = { ...DEFAULT_PROGRESS };
  setPlayerProgress(reset);
  setStoredPowerups(DEFAULT_POWERUPS);
  return reset;
}

export function addCoinsToProgress(amount) {
  const progress = getPlayerProgress();
  const updated = { ...progress, coins: (progress.coins ?? 0) + amount };
  setPlayerProgress(updated);
  return updated;
}

export function getStoredPowerups() {
  return readJson(PLAYER_POWERUPS_KEY, DEFAULT_POWERUPS);
}

export function setStoredPowerups(powerups) {
  writeJson(PLAYER_POWERUPS_KEY, powerups);
}

export function clearUnusedExtraLife() {
  const powerups = getStoredPowerups();
  if ((powerups.extraLife ?? 0) <= 0) return null;

  setStoredPowerups({ ...powerups, extraLife: 0 });
  return getPlayerProgress();
}

export function buyCheckpointItem(itemId, checkpoint = 1) {
  const item = SHOP_ITEMS.find((entry) => entry.id === itemId);
  if (!item) {
    return { ok: false, message: 'Item not found' };
  }

  const price = getItemPrice(item, checkpoint);
  const progress = getPlayerProgress();
  const powerups = getStoredPowerups();

  if ((progress.coins ?? 0) < price) {
    return { ok: false, message: 'Not enough coins' };
  }

  const updatedProgress = { ...progress, coins: progress.coins - price };

  if (itemId === 'life') {
    updatedProgress.life = (updatedProgress.life ?? DEFAULT_PROGRESS.life) + 1;
    setStoredPowerups({ ...powerups, extraLife: (powerups.extraLife ?? 0) + 1 });
  }

  if (itemId === 'time') {
    setStoredPowerups({ ...powerups, timeBoost: 1 });
  }

  setPlayerProgress(updatedProgress);
  return { ok: true, progress: updatedProgress, item };
}

function consumeTimeBoost() {
  const powerups = getStoredPowerups();
  const available = powerups.timeBoost ?? 0;

  if (available <= 0) return 0;

  setStoredPowerups({ ...powerups, timeBoost: 0 });
  return 10;
}

export function getInitialGameTime(baseTime, gameId, routeKey) {
  const sessionKey = `time-boost-applied:${gameId}:${routeKey}`;

  if (sessionStorage.getItem(sessionKey)) {
    return baseTime;
  }

  const extraTime = consumeTimeBoost();
  sessionStorage.setItem(sessionKey, '1');
  return baseTime + extraTime;
}

export function getReplayGameTime(baseTime) {
  return baseTime + consumeTimeBoost();
}

export function getOwnedCount(itemId) {
  const powerups = getStoredPowerups();

  if (itemId === 'time') return powerups.timeBoost ?? 0;
  if (itemId === 'life') return powerups.extraLife ?? 0;

  return 0;
}
