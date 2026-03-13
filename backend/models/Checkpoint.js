import mongoose from 'mongoose';

const checkpointSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSession',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  level: {
    type: Number,
    required: true,
    min: 1
  },
  qrCode: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  miniGameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Minigame',
    default: null
  }
}, {
  timestamps: true
});

const Checkpoint = mongoose.model('Checkpoint', checkpointSchema);

export default Checkpoint;
