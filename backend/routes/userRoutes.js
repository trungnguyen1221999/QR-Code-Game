import express from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getLeaderboard,
  addItemToUser,
  removeItemFromUser,
  uploadUserAvatar
} from '../controllers/userController.js';

import uploadAvatar from '../middleware/uploadAvatar.js';

const router = express.Router();

// Validation middleware
const createUserValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('name')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters')
];

// Routes
router.get('/', getAllUsers);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUserById);
router.post('/', createUserValidation, createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Upload avatar for user
router.post('/:id/avatar', uploadAvatar, uploadUserAvatar);

router.post('/:id/items/:itemId', addItemToUser);
router.delete('/:id/items/:itemId', removeItemFromUser);

export default router;