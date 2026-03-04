import mongoose from 'mongoose';

const minigameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  timeLimit: {
    type: Number,
    required: true,
    min: 0
  },
  reward: {
    money: {
      type: Number,
      min: 0
    }
  },
  checkpointId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Checkpoint'
  }
}, {
  timestamps: true
});

const Minigame = mongoose.model('Minigame', minigameSchema);

export default Minigame;