import Checkpoint from '../models/Checkpoint.js';
import { getRandomMinigame } from './minigameUtils.js';

// Handle QR code scan logic
export const handleQrCodeScan = async (qrCodeData, userId) => {
  try {
    // Find checkpoint by QR code
    const checkpoint = await Checkpoint.findOne({ qrCode: qrCodeData });
    
    if (!checkpoint) {
      throw new Error('Invalid QR code');
    }
    
    // Get random minigame
    const randomMinigame = await getRandomMinigame();
    
    return {
      checkpoint,
      minigame: randomMinigame,
      message: `Welcome to ${checkpoint.name}! Play ${randomMinigame.name}`
    };
  } catch (error) {
    throw error;
  }
};

// Validate if user can access this checkpoint level
export const validateCheckpointAccess = (userCurrentLevel, checkpointLevel) => {
  return userCurrentLevel >= checkpointLevel;
};