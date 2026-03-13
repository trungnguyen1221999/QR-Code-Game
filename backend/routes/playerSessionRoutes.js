import express from 'express';
import {
  joinGame,
  getPlayerSession,
  updateCheckpoint,
  buyItem,
  earnMoney,
  loseLife,
  finishPlayer
} from '../controllers/playerSessionController.js';

const router = express.Router();

router.post('/join', joinGame);
router.get('/:id', getPlayerSession);
router.patch('/:id/checkpoint', updateCheckpoint);
router.patch('/:id/buy', buyItem);
router.patch('/:id/earn-money', earnMoney);
router.patch('/:id/lose-life', loseLife);
router.patch('/:id/finish', finishPlayer);

export default router;
