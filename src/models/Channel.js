const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
});
const ChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  premium: {
    type: Boolean,
    default: false
  },
  adminOnly: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [MessageSchema],
  subscriptionPrice: {
    type: Number,
    default: 0
  },
  shareLink: {
    type: String
  },
  statistics: {
    totalViews: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    messagesSent: {
      type: Number,
      default: 0
    },
    averageEngagement: {
      type: Number,
      default: 0
    }
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('Channel', ChannelSchema);