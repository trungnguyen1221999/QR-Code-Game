import express from 'express';
import {
  createSession,
  getSessionByCode,
  getSessionById,
  startSession,
  finishSession,
  getSessionPlayers,
  getLeaderboard,
  getSessionsByHost
} from '../controllers/sessionController.js';

const router = express.Router();

router.post('/', createSession);
router.get('/code/:code', getSessionByCode);
router.get('/host/:hostId', getSessionsByHost);
router.get('/:id', getSessionById);
router.post('/:id/start', startSession);
router.post('/:id/finish', finishSession);
router.get('/:id/players', getSessionPlayers);
router.get('/:id/leaderboard', getLeaderboard);

export default router;
