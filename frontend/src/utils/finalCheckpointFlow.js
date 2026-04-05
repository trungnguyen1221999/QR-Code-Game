const PLAYER_PROGRESS_KEY = 'playerGameProgress';

export function getTotalCheckpoints() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    const len = session?.gameOrder?.length;
    return (len && len > 0) ? len : 13;
  } catch {
    return 13;
  }
}

export function isFinalCheckpointClear(checkpoint) {
  try {
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    const progress = JSON.parse(localStorage.getItem(PLAYER_PROGRESS_KEY) || 'null') || {};
    const totalCheckpoints = getTotalCheckpoints();
    const completed = progress.completed ?? 0;
    const completedList = Array.isArray(progress.completedList) ? progress.completedList : [];
    const gameMode = session?.gameMode || 'ordered';

    if (totalCheckpoints <= 1) {
      return true;
    }

    if (gameMode === 'random') {
      const uniqueCompleted = new Set(completedList);
      return !uniqueCompleted.has(checkpoint) && uniqueCompleted.size >= totalCheckpoints - 1;
    }

    return checkpoint >= totalCheckpoints && completed >= totalCheckpoints - 1;
  } catch {
    return false;
  }
}
