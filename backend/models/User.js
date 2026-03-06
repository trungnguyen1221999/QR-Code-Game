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
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: ''
  },
  money: {
    type: Number,
    default: 0
  },
  currentCheckpoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Checkpoint'
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  numberOfKey: {
    type: Number,
    default: 0
  },

  finalScore: {
    type: Number,
    default: 0
  },
  approve: {
    type: String,
    enum: ['yes', 'no', 'pending'],
    default: 'pending'
  },
  isInWaitingRoom: {
    type: Boolean,
    default: false
  },
  lastPing: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;