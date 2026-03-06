import mongoose from 'mongoose';

const hostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Host = mongoose.model('Host', hostSchema);

export default Host;