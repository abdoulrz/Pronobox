import mongoose from 'mongoose';

const PronoSchema = new mongoose.Schema({
  matchId: { type: Number, required: true },
  homeTeamName: { type: String, required: true },
  awayTeamName: { type: String, required: true },
  homeLogo: { type: String },
  awayLogo: { type: String },
  
  league: { type: String, default: '' },
  matchDate: { type: Date },

  // Free Section
  freeExpectedResult: { type: String, default: '' },
  freeConfidence: { type: Number, default: 0 },
  freeObservation: { type: String, default: '' },
  
  // Premium Section
  premiumExpectedResult: { type: String, default: '' },
  premiumOdds: { type: Number, default: 0 },
  premiumConfidence: { type: Number, default: 0 },
  premiumObservation: { type: String, default: '' },

  status: { type: String, enum: ['pending', 'won', 'lost', 'partial'], default: 'pending' },
  freeStatus: { type: String, enum: ['pending', 'won', 'lost'], default: 'pending' },
  premiumStatus: { type: String, enum: ['pending', 'won', 'lost'], default: 'pending' },
  actualResult: { type: String, default: '' },
  verifiedAt: { type: Date },
  reactions: [{
    emoji: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }]
}, {
  timestamps: true
});

const Prono = mongoose.model('Prono', PronoSchema);
export default Prono;
