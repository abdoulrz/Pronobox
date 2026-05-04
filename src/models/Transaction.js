const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['recharge', 'subscription', 'pro', 'withdrawal', 'product', 'tip'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  method: {
    type: String,
    enum: ['card', 'mobile', 'crypto', 'wallet'],
    required: true
  },
  itemId: {
    type: String
  },
  itemName: {
    type: String
  },
  recipient: {
    type: String
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('Transaction', TransactionSchema);