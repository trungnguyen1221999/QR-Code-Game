import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  avatar: {
    type: String,
    default: ''
  },
  // All-time aggregate
  totalScore: {
    type: Number,
    default: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  bestRank: {
    type: Number,
    default: null
  },
  // Per-game score history
  gameScores: [
    {
      sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GameSession',
        required: true
      },
      score: {
        type: Number,
        required: true,
        default: 0
      },
      rank: {
        type: Number,
        default: null
      },
      playedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
