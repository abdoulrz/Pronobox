import mongoose from 'mongoose';

const PronoSchema = new mongoose.Schema({
  matchId: { type: Number, required: true },
  homeTeamName: { type: String, required: true },
  awayTeamName: { type: String, required: true },
  homeLogo: { type: String },
  awayLogo: { type: String },
  
  // Free Prediction Info
  freePrediction: {
    choice: { type: String, enum: ['home', 'draw', 'away'], required: true },
    odds: {
      home: { type: Number, default: 0 },
      draw: { type: Number, default: 0 },
      away: { type: Number, default: 0 },
    },
    bookmaker: { type: String, default: 'bet365' }
  },

  // Perspective Info
  keyInfos: [{ type: String }],

  // Premium Section
  premiumAnalysis: { type: String, default: '' },
  iaOpinion: { type: String, default: '' },

  status: { type: String, enum: ['pending', 'won', 'lost'], default: 'pending' }
}, {
  timestamps: true
});

const Prono = mongoose.model('Prono', PronoSchema);
export default Prono;
