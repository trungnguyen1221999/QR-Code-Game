import Checkpoint from '../models/Checkpoint.js';
import { validationResult } from 'express-validator';
import { handleQrCodeScan } from '../utils/checkpointUtils.js';

// Get all checkpoints
export const getAllCheckpoints = async (req, res) => {
  try {
    const checkpoints = await Checkpoint.find().sort({ level: 1 });
    res.json(checkpoints);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get checkpoint by ID
export const getCheckpointById = async (req, res) => {
  try {
    const checkpoint = await Checkpoint.findById(req.params.id);
    if (!checkpoint) {
      return res.status(404).json({ message: 'Checkpoint not found' });
    }
    res.json(checkpoint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get checkpoint by QR code
export const getCheckpointByQrCode = async (req, res) => {
  try {
    const { qrCode } = req.params;
    const checkpoint = await Checkpoint.findOne({ qrCode });
    if (!checkpoint) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }
    res.json(checkpoint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Scan QR code (main logic)
export const scanQrCode = async (req, res) => {
  try {
    const { qrCode } = req.params;
    const { userId } = req.body;

    const result = await handleQrCodeScan(qrCode, userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create new checkpoint
export const createCheckpoint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, level, qrCode } = req.body;

    // Check if QR code already exists
    const existingCheckpoint = await Checkpoint.findOne({ qrCode });
    if (existingCheckpoint) {
      return res.status(400).json({ message: 'QR code already exists' });
    }

    const checkpoint = new Checkpoint({
      name,
      level,
      qrCode
    });

    await checkpoint.save();

    res.status(201).json({
      message: 'Checkpoint created successfully',
      checkpoint
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update checkpoint
export const updateCheckpoint = async (req, res) => {
  try {
    const checkpointId = req.params.id;
    const updates = req.body;

    const checkpoint = await Checkpoint.findByIdAndUpdate(
      checkpointId,
      updates,
      { new: true, runValidators: true }
    );

    if (!checkpoint) {
      return res.status(404).json({ message: 'Checkpoint not found' });
    }

    res.json({
      message: 'Checkpoint updated successfully',
      checkpoint
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete checkpoint
export const deleteCheckpoint = async (req, res) => {
  try {
    const checkpoint = await Checkpoint.findByIdAndDelete(req.params.id);
    if (!checkpoint) {
      return res.status(404).json({ message: 'Checkpoint not found' });
    }
    res.json({ message: 'Checkpoint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};