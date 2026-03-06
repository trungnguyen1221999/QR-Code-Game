import Host from '../models/Host.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

export const getAllHosts = async (req, res) => {
  try {
    const hosts = await Host.find();
    res.json(hosts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getHostById = async (req, res) => {
  try {
    const host = await Host.findById(req.params.id);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }
    res.json(host);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createHost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, name, password } = req.body;
    const existingHost = await Host.findOne({ username });
    if (existingHost) {
      return res.status(400).json({ message: 'Host already exists with this username' });
    }
    const host = new Host({ username, name, password });
    await host.save();
    res.status(201).json({ message: 'Host created successfully', host });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateHost = async (req, res) => {
  try {
    const hostId = req.params.id;
    const updates = req.body;
    const host = await Host.findByIdAndUpdate(hostId, updates, { new: true, runValidators: true });
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }
    res.json({ message: 'Host updated successfully', host });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteHost = async (req, res) => {
  try {
    const host = await Host.findByIdAndDelete(req.params.id);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }
    res.json({ message: 'Host deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginHost = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    const host = await Host.findOne({ username });
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }
    res.json({ message: 'Login successful', host });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logoutHost = async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending players (only in waiting room)
export const getPendingPlayers = async (req, res) => {
  try {
    const players = await User.find({ approve: 'pending', isInWaitingRoom: true });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get approved players (only in waiting room)
export const getApprovedPlayers = async (req, res) => {
  try {
    const players = await User.find({ approve: 'yes', isInWaitingRoom: true });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get rejected players (only in waiting room)
export const getRejectedPlayers = async (req, res) => {
  try {
    const players = await User.find({ approve: 'no', isInWaitingRoom: true });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve player
export const approvePlayer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { approve: 'yes' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json({ message: 'Player approved', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject player
export const rejectPlayer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { approve: 'no' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json({ message: 'Player rejected', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
