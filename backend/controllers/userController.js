// Heartbeat: update lastPing for a user
export const heartbeat = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { lastPing: new Date() },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Heartbeat received', lastPing: user.lastPing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get online user count (users with recent lastPing)
export const getOnlineUserCount = async (req, res) => {
  try {
    const THRESHOLD_MINUTES = 1; // consider online if pinged within last 1 minute
    const threshold = new Date(Date.now() - THRESHOLD_MINUTES * 60 * 1000);
    const count = await User.countDocuments({ lastPing: { $gte: threshold } });
    res.status(200).json({ onlineUserCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Login user
export const loginUser = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout user (stub, stateless)
export const logoutUser = async (req, res) => {
  try {
    // If using sessions or tokens, invalidate here
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Join waiting room
export const joinWaitingRoom = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isInWaitingRoom: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Joined waiting room', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Leave waiting room
export const leaveWaitingRoom = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isInWaitingRoom: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Left waiting room', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Upload avatar for user
export const uploadUserAvatar = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!req.avatarUrl) {
      return res.status(400).json({ message: 'No avatar uploaded' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: req.avatarUrl },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl: req.avatarUrl,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { validationResult } from 'express-validator';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate('items');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('items');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, name, avatar } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this username' 
      });
    }

    // Create new user
    const user = new User({
      username,
      name,
      avatar: avatar || ''
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).populate('items');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ finalScore: -1 })
      .limit(10)
      .select('username name avatar finalScore currentCheckpoint');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add item to user
export const addItemToUser = async (req, res) => {
  try {
    const { id: userId, itemId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has this item
    if (user.items.includes(itemId)) {
      return res.status(400).json({ message: 'User already has this item' });
    }

    user.items.push(itemId);
    await user.save();

    const updatedUser = await User.findById(userId).populate('items');
    res.json({
      message: 'Item added successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove item from user
export const removeItemFromUser = async (req, res) => {
  try {
    const { id: userId, itemId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove item from array
    user.items = user.items.filter(item => item.toString() !== itemId);
    await user.save();

    const updatedUser = await User.findById(userId).populate('items');
    res.json({
      message: 'Item removed successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};