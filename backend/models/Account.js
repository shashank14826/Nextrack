const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Savings', 'Current', 'Investment', 'Credit Card', 'Cash']
  },
  balance: {
    type: Number,
    default: 0
  },
  income: {
    type: Number,
    default: 0
  },
  expense: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account; 