import mongoose from 'mongoose';
const MessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  audioUrl: {
    type: String,
    required: false
  },
  isImage: {
    type: Boolean,
    default: false
  },
  isVoiceMessage: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  reactions: [{
    emoji: String,
    count: Number,
    users: [String]
  }],
  replyTo: {
    id: String,
    text: String,
    username: String
  },
  time: {
    type: Date,
    default: Date.now
  },
  pronoMatchId: {
    type: Number,
    required: false
  },
  pronoStatus: {
    type: String,
    enum: ['pending', 'won', 'lost', 'partial', ''],
    default: ''
  },
  pronoActualResult: {
    type: String,
    default: ''
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
  allowVoiceMessages: {
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
export default mongoose.model('Channel', ChannelSchema);