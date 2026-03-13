import mongoose from 'mongoose';

const playerSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSession',
    required: true
  },
  money: {
    type: Number,
    default: 0
  },
  lives: {
    type: Number,
    default: 3
  },
  currentCheckpointIndex: {
    type: Number,
    default: 0
  },
  completedCheckpoints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Checkpoint'
  }],
  purchasedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  score: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'eliminated', 'finished'],
    default: 'waiting'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  finishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const PlayerSession = mongoose.model('PlayerSession', playerSessionSchema);

export default PlayerSession;
