import mongoose from 'mongoose';

const checkpointSchema = new mongoose.Schema({
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
  }
}, {
  timestamps: true
});

const Checkpoint = mongoose.model('Checkpoint', checkpointSchema);

export default Checkpoint;