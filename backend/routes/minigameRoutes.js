import express from 'express';
import { body } from 'express-validator';
import {
  getAllMinigames,
  getMinigameById,
  getMinigamesByType,
  getRandomMinigameController,
  getRandomMinigameByTypeController,
  createMinigame,
  updateMinigame,
  deleteMinigame
} from '../controllers/minigameController.js';

const router = express.Router();

// Validation middleware
const createMinigameValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('type')
    .isLength({ min: 1, max: 50 })
    .withMessage('Type must be between 1 and 50 characters'),
  body('timeLimit')
    .isNumeric()
    .withMessage('Time limit must be a number')
    .isInt({ min: 0 })
    .withMessage('Time limit must be greater than or equal to 0')
];

// Routes
router.get('/', getAllMinigames);
router.get('/random', getRandomMinigameController);
router.get('/type/:type', getMinigamesByType);
router.get('/random/type/:type', getRandomMinigameByTypeController);
router.get('/:id', getMinigameById);
router.post('/', createMinigameValidation, createMinigame);
router.put('/:id', updateMinigame);
router.delete('/:id', deleteMinigame);

export default router;