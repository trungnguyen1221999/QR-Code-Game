import Minigame from '../models/Minigame.js';

// Random pick a minigame
export const getRandomMinigame = async () => {
  try {
    // Get total count of minigames
    const count = await Minigame.countDocuments();
    
    if (count === 0) {
      throw new Error('No minigames available');
    }
    
    // Generate random index
    const randomIndex = Math.floor(Math.random() * count);
    
    // Get random minigame
    const randomMinigame = await Minigame.findOne().skip(randomIndex);
    
    return randomMinigame;
  } catch (error) {
    throw error;
  }
};

// Random pick minigame by type
export const getRandomMinigameByType = async (type) => {
  try {
    const minigames = await Minigame.find({ type });
    
    if (minigames.length === 0) {
      throw new Error(`No minigames found for type: ${type}`);
    }
    
    const randomIndex = Math.floor(Math.random() * minigames.length);
    return minigames[randomIndex];
  } catch (error) {
    throw error;
  }
};

// Random pick minigame excluding specific IDs (to avoid repetition)
export const getRandomMinigameExcluding = async (excludeIds = []) => {
  try {
    const query = excludeIds.length > 0 
      ? { _id: { $nin: excludeIds } } 
      : {};
    
    const count = await Minigame.countDocuments(query);
    
    if (count === 0) {
      // If all games excluded, fallback to any random game
      return await getRandomMinigame();
    }
    
    const randomIndex = Math.floor(Math.random() * count);
    const randomMinigame = await Minigame.findOne(query).skip(randomIndex);
    
    return randomMinigame;
  } catch (error) {
    throw error;
  }
};