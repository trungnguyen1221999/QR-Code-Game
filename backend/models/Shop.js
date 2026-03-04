import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  checkpointLevel: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

const Shop = mongoose.model('Shop', shopSchema);

export default Shop;