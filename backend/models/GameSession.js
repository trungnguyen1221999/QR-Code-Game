import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  totalTime: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'finished'],
    default: 'waiting'
  },
  checkpointIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Checkpoint'
  }],
  startedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  difficulty: {
    type: String,
    enum: ['easy', 'normal', 'hard'],
    default: 'hard'
  }
}, {
  timestamps: true
});

const GameSession = mongoose.model('GameSession', gameSessionSchema);

export default GameSession;
