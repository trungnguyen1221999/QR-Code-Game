export const SHOP_ITEMS = [
  {
    id: 'time',
    emoji: '⏱️',
    img: '/shop/x2time.png',
    label: 'Time Boost',
    desc: 'Extend the next game time limit by 10 seconds',
    price: 50,
  },
  {
    id: 'life',
    emoji: '❤️',
    img: null,
    label: 'Extra Life',
    desc: 'Add one more life to your player',
    price: 50,
  },
];

const PLAYER_PROGRESS_KEY = 'playerGameProgress';
const PLAYER_POWERUPS_KEY = 'playerGamePowerups';
const DEFAULT_PROGRESS = { completed: 0, current: 1, life: 3, coins: 0 };

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

export function addCoinsToProgress(amount) {
  const progress = getPlayerProgress();
  const updated = { ...progress, coins: (progress.coins ?? 0) + amount };
  setPlayerProgress(updated);
  return updated;
}

export function getStoredPowerups() {
  return readJson(PLAYER_POWERUPS_KEY, { timeBoost: 0 });
}

export function setStoredPowerups(powerups) {
  writeJson(PLAYER_POWERUPS_KEY, powerups);
}

export function buyCheckpointItem(itemId) {
  const item = SHOP_ITEMS.find((entry) => entry.id === itemId);
  if (!item) {
    return { ok: false, message: 'Item not found' };
  }

  const progress = getPlayerProgress();
  if ((progress.coins ?? 0) < item.price) {
    return { ok: false, message: 'Not enough coins' };
  }

  const updatedProgress = { ...progress, coins: progress.coins - item.price };
  const powerups = getStoredPowerups();

  if (itemId === 'life') {
    updatedProgress.life = (updatedProgress.life ?? DEFAULT_PROGRESS.life) + 1;
  }

  if (itemId === 'time') {
    setStoredPowerups({ ...powerups, timeBoost: (powerups.timeBoost ?? 0) + 1 });
  }

  setPlayerProgress(updatedProgress);
  return { ok: true, progress: updatedProgress };
}

function consumeTimeBoost() {
  const powerups = getStoredPowerups();
  const available = powerups.timeBoost ?? 0;

  if (available <= 0) return 0;

  setStoredPowerups({ ...powerups, timeBoost: available - 1 });
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
