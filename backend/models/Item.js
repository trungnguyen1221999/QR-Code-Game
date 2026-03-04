import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  desc: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

const Item = mongoose.model('Item', itemSchema);

export default Item;