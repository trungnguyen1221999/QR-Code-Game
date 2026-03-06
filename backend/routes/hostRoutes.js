import express from 'express';
import { body } from 'express-validator';
import {
  getAllHosts,
  getHostById,
  createHost,
  updateHost,
  deleteHost,
  loginHost,
  logoutHost,
  approvePlayer,
  rejectPlayer,
  getPendingPlayers,
  getApprovedPlayers,
  getRejectedPlayers
} from '../controllers/hostController.js';

const router = express.Router();

const createHostValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('name')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters')
];

router.get('/', getAllHosts);
router.get('/:id', getHostById);
router.post('/', createHostValidation, createHost);
router.put('/:id', updateHost);
router.delete('/:id', deleteHost);
router.post('/login', loginHost);
router.post('/logout', logoutHost);

// Player management
router.get('/players/pending', getPendingPlayers);
router.get('/players/approved', getApprovedPlayers);
router.get('/players/rejected', getRejectedPlayers);
router.put('/players/:userId/approve', approvePlayer);
router.put('/players/:userId/reject', rejectPlayer);

export default router;
