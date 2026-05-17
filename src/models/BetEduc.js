import mongoose from 'mongoose';

const BetEducSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String, // E-book, Vidéo, Article, Formation, etc.
    required: true
  },
  category: {
    type: String,
    enum: ['free', 'premium'],
    required: true
  },
  price: {
    type: Number,
    required: function() { return this.category === 'premium'; },
    default: 0
  },
  image: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['file', 'link', 'text'],
    required: true
  },
  content: {
    type: String, // URL for file/link, or the actual text analysis
    required: true
  },
  description: {
    type: String,
    required: true
  },
  comments: [{
    username: String,
    avatar: String,
    text: String,
    createdAt: { type: Date, default: Date.now },
    replies: [{
      username: String,
      avatar: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }]
  }]
}, {
  timestamps: true
});

export default mongoose.model('BetEduc', BetEducSchema);
