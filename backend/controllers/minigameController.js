import Minigame from '../models/Minigame.js';
import { validationResult } from 'express-validator';
import { getRandomMinigame, getRandomMinigameByType } from '../utils/minigameUtils.js';

// Get all minigames
export const getAllMinigames = async (req, res) => {
  try {
    const minigames = await Minigame.find().populate('checkpointId');
    res.json(minigames);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get minigame by ID
export const getMinigameById = async (req, res) => {
  try {
    const minigame = await Minigame.findById(req.params.id).populate('checkpointId');
    if (!minigame) {
      return res.status(404).json({ message: 'Minigame not found' });
    }
    res.json(minigame);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get minigames by type
export const getMinigamesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const minigames = await Minigame.find({ type }).populate('checkpointId');
    res.json(minigames);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get random minigame
export const getRandomMinigameController = async (req, res) => {
  try {
    const randomMinigame = await getRandomMinigame();
    res.json(randomMinigame);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get random minigame by type
export const getRandomMinigameByTypeController = async (req, res) => {
  try {
    const { type } = req.params;
    const randomMinigame = await getRandomMinigameByType(type);
    res.json(randomMinigame);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new minigame
export const createMinigame = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, timeLimit, reward, checkpointId } = req.body;

    const minigame = new Minigame({
      name,
      type,
      timeLimit,
      reward,
      checkpointId
    });

    await minigame.save();

    res.status(201).json({
      message: 'Minigame created successfully',
      minigame
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update minigame
export const updateMinigame = async (req, res) => {
  try {
    const minigameId = req.params.id;
    const updates = req.body;

    const minigame = await Minigame.findByIdAndUpdate(
      minigameId,
      updates,
      { new: true, runValidators: true }
    ).populate('checkpointId');

    if (!minigame) {
      return res.status(404).json({ message: 'Minigame not found' });
    }

    res.json({
      message: 'Minigame updated successfully',
      minigame
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete minigame
export const deleteMinigame = async (req, res) => {
  try {
    const minigame = await Minigame.findByIdAndDelete(req.params.id);
    if (!minigame) {
      return res.status(404).json({ message: 'Minigame not found' });
    }
    res.json({ message: 'Minigame deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};