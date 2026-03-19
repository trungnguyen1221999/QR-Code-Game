import GameSession from '../models/GameSession.js';
import Checkpoint from '../models/Checkpoint.js';
import PlayerSession from '../models/PlayerSession.js';

// Generate a random 6-character uppercase code
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // avoid 0/O, 1/I confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// POST /api/sessions - host creates a game session
export const createSession = async (req, res) => {
  try {
    const { hostId, name, totalTime } = req.body;

    if (!hostId || !name || !totalTime) {
      return res.status(400).json({ message: 'hostId, name, and totalTime are required' });
    }

    // Generate unique code
    let code;
    let exists = true;
    while (exists) {
      code = generateCode();
      exists = await GameSession.findOne({ code });
    }

    const session = new GameSession({ hostId, name, code, totalTime });
    await session.save();

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sessions/code/:code - check if a code is valid
export const getSessionByCode = async (req, res) => {
  try {
    const session = await GameSession.findOne({ code: req.params.code.toUpperCase() });

    if (!session) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (session.status === 'finished') {
      return res.status(410).json({ message: 'Game has already ended' });
    }

    if (session.status === 'in_progress' && session.expiresAt && new Date() > session.expiresAt) {
      return res.status(410).json({ message: 'Game time has expired' });
    }

    res.json({
      id: session._id,
      name: session.name,
      status: session.status,
      code: session.code
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sessions/:id - get session details
export const getSessionById = async (req, res) => {
  try {
    const session = await GameSession.findById(req.params.id)
      .populate('checkpointIds');

    if (!session) return res.status(404).json({ message: 'Session not found' });

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/sessions/:id/start - host starts the game
export const startSession = async (req, res) => {
  try {
    const session = await GameSession.findById(req.params.id);

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status !== 'waiting') {
      return res.status(400).json({ message: 'Game has already started or finished' });
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + session.totalTime * 60 * 1000);

    session.status = 'in_progress';
    session.startedAt = startedAt;
    session.expiresAt = expiresAt;
    await session.save();

    // Move all waiting players to active
    await PlayerSession.updateMany(
      { sessionId: session._id, status: 'waiting' },
      { status: 'active' }
    );

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/sessions/:id/finish - end the game
export const finishSession = async (req, res) => {
  try {
    const session = await GameSession.findById(req.params.id);

    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'finished';
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sessions/:id/players - get all players in a session (for host dashboard)
export const getSessionPlayers = async (req, res) => {
  try {
    const players = await PlayerSession.find({ sessionId: req.params.id })
      .populate('userId', 'username avatar');

    const result = players.map(p => ({
      _id: p._id,
      username: p.userId?.username,
      avatar: p.userId?.avatar,
      userId: p.userId,
      status: p.status,
      lives: p.lives,
      money: p.money,
      score: p.score,
      finishedAt: p.finishedAt,
      currentCheckpointIndex: p.currentCheckpointIndex,
      checkpointsCompleted: p.currentCheckpointIndex,
      lastCheckpointAt: p.lastCheckpointAt,
      joinedAt: p.joinedAt,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sessions/:id/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const players = await PlayerSession.find({ sessionId: req.params.id })
      .populate('userId', 'username avatar')
      .sort({ score: -1 });

    const leaderboard = players.map((p, index) => ({
      rank: index + 1,
      username: p.userId?.username,
      avatar: p.userId?.avatar,
      score: p.score,
      status: p.status,
      completedCheckpoints: p.currentCheckpointIndex
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sessions/host/:hostId - get all sessions by host
export const getSessionsByHost = async (req, res) => {
  try {
    const sessions = await GameSession.find({ hostId: req.params.hostId })
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
