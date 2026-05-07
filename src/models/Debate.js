import mongoose from 'mongoose';

// Schema for Replies on Messages
const ReplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true // adds createdAt and updatedAt
});

// Schema for Messages (Comments) on a Debate
const MessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [ReplySchema]
}, {
  timestamps: true
});

// Main Debate Schema
const DebateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String // URLs or base64 data
  }],
  category: {
    type: String,
    required: true,
    default: 'Général'
  },
  participants: {
    type: Number,
    default: 1 // Starts with the author
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [MessageSchema],
  // TTL Index: Auto-delete the debate after this date. 
  // Default is 7 days from creation.
  expiresAt: {
    type: Date,
    default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
    expires: 0 
  }
}, {
  timestamps: true
});

export default mongoose.model('Debate', DebateSchema);
