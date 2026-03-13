import PlayerSession from '../models/PlayerSession.js';
import GameSession from '../models/GameSession.js';
import User from '../models/User.js';

// POST /api/player-sessions/join - user joins a game
export const joinGame = async (req, res) => {
  try {
    const { username, code, avatar } = req.body;

    if (!username || !code) {
      return res.status(400).json({ message: 'username and code are required' });
    }

    // Find the game session
    const gameSession = await GameSession.findOne({ code: code.toUpperCase() });
    if (!gameSession) {
      return res.status(404).json({ message: 'Game not found. Check the code and try again.' });
    }

    // Check if game is still joinable
    if (gameSession.status === 'finished') {
      return res.status(410).json({ message: 'Game has already ended' });
    }
    if (gameSession.status === 'in_progress' && gameSession.expiresAt && new Date() > gameSession.expiresAt) {
      return res.status(410).json({ message: 'Game time has expired' });
    }

    // Find or create user (no password needed)
    let user = await User.findOne({ username: username.trim() });
    if (!user) {
      user = await User.create({ username: username.trim(), avatar: avatar || undefined });
    } else if (avatar) {
      user.avatar = avatar;
      await user.save();
    }

    // Check if already in this session
    let playerSession = await PlayerSession.findOne({ userId: user._id, sessionId: gameSession._id });
    if (!playerSession) {
      const initialStatus = gameSession.status === 'in_progress' ? 'active' : 'waiting';
      playerSession = await PlayerSession.create({
        userId: user._id,
        sessionId: gameSession._id,
        status: initialStatus
      });
    }

    // Determine where to redirect
    const redirect = gameSession.status === 'in_progress' ? 'game' : 'waiting-room';

    res.status(200).json({
      redirect,
      user: { id: user._id, username: user.username, avatar: user.avatar },
      playerSession: { id: playerSession._id, status: playerSession.status },
      session: {
        id: gameSession._id,
        name: gameSession.name,
        status: gameSession.status,
        expiresAt: gameSession.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/player-sessions/:id - get player session info
export const getPlayerSession = async (req, res) => {
  try {
    const ps = await PlayerSession.findById(req.params.id)
      .populate('userId', 'username avatar')
      .populate('completedCheckpoints')
      .populate('purchasedItems');

    if (!ps) return res.status(404).json({ message: 'Player session not found' });

    res.json(ps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/player-sessions/:id/checkpoint - player scans QR, updates checkpoint
export const updateCheckpoint = async (req, res) => {
  try {
    const { checkpointId, scoreEarned } = req.body;
    const ps = await PlayerSession.findById(req.params.id);

    if (!ps) return res.status(404).json({ message: 'Player session not found' });

    // Add to completed if not already
    if (!ps.completedCheckpoints.includes(checkpointId)) {
      ps.completedCheckpoints.push(checkpointId);
      ps.currentCheckpointIndex += 1;
      ps.score += scoreEarned || 0;
    }

    await ps.save();
    res.json(ps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/player-sessions/:id/buy - player buys an item
export const buyItem = async (req, res) => {
  try {
    const { itemId, price } = req.body;
    const ps = await PlayerSession.findById(req.params.id);

    if (!ps) return res.status(404).json({ message: 'Player session not found' });
    if (ps.money < price) {
      return res.status(400).json({ message: 'Not enough money' });
    }

    ps.purchasedItems.push(itemId);
    ps.money -= price;
    await ps.save();

    res.json(ps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/player-sessions/:id/earn-money - player earns money from minigame
export const earnMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    const ps = await PlayerSession.findById(req.params.id);

    if (!ps) return res.status(404).json({ message: 'Player session not found' });

    ps.money += amount || 0;
    await ps.save();

    res.json(ps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/player-sessions/:id/lose-life - player loses a life
export const loseLife = async (req, res) => {
  try {
    const ps = await PlayerSession.findById(req.params.id);

    if (!ps) return res.status(404).json({ message: 'Player session not found' });

    ps.lives = Math.max(0, ps.lives - 1);
    if (ps.lives === 0) {
      ps.status = 'eliminated';
    }
    await ps.save();

    res.json(ps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/player-sessions/:id/finish - player finishes the final game
export const finishPlayer = async (req, res) => {
  try {
    const { finalScore } = req.body;
    const ps = await PlayerSession.findById(req.params.id);

    if (!ps) return res.status(404).json({ message: 'Player session not found' });

    ps.status = 'finished';
    ps.finishedAt = new Date();
    if (finalScore !== undefined) ps.score = finalScore;
    await ps.save();

    // Update user aggregate stats
    await User.findByIdAndUpdate(ps.userId, {
      $inc: { totalScore: ps.score, gamesPlayed: 1 }
    });

    res.json(ps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
