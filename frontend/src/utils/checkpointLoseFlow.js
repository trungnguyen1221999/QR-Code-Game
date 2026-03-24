import { playerAPI } from './api';
import {
  applyLossToStoredProgress,
  clearUnusedExtraLife,
  resetProgressToCheckpointOne,
} from './checkpointShop';

export const INITIAL_LOSE_STATE = Object.freeze({
  remainingLives: null,
  needsLifePurchase: false,
});

export async function registerCheckpointLifeLoss(playerSessionId) {
  const summary = applyLossToStoredProgress();

  try {
    if (playerSessionId) {
      await playerAPI.loseLife(playerSessionId);
    }
  } catch (error) {
    throw error;
  }

  return summary;
}

export function applyLosePurchase(result, setLoseState) {
  if (result.item?.id !== 'life') return;

  setLoseState({
    remainingLives: result.progress?.life ?? 1,
    needsLifePurchase: false,
  });
}

export function handleCheckpointLoseExit(loseState, navigate, playerSessionId) {
  if (loseState.needsLifePurchase) {
    resetProgressToCheckpointOne();
    if (playerSessionId) {
      playerAPI.resetToStart(playerSessionId).catch(() => {});
    }
  } else {
    clearUnusedExtraLife();
  }

  navigate('/game');
}

export function handleCheckpointLosePrimaryAction(loseState, navigate, onReplay, playerSessionId) {
  if (loseState.needsLifePurchase) {
    resetProgressToCheckpointOne();
    if (playerSessionId) {
      playerAPI.resetToStart(playerSessionId).catch(() => {});
    }
    navigate('/game');
    return;
  }

  onReplay();
}
