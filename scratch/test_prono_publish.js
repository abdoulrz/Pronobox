import mongoose from 'mongoose';
import Prono from '../src/models/Prono.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try loading env from multiple paths
const envPaths = ['./src/.env', './.env'];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    console.log(`Loaded environment from ${p}`);
  }
}

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pronosbox";
console.log("Using MongoDB URI:", uri.replace(/\/\/.*@/, '//<credentials>@'));

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected successfully to database!");

    // Fetch existing pronos
    const pronos = await Prono.find({});
    console.log(`Current pronos count: ${pronos.length}`);
    pronos.forEach((p, idx) => {
      console.log(`Prono #${idx + 1}:`);
      console.log(`  ID: ${p._id}`);
      console.log(`  Match ID: ${p.matchId}`);
      console.log(`  Match: ${p.homeTeamName} vs ${p.awayTeamName}`);
      console.log(`  Date: ${p.matchDate}`);
      console.log(`  Status: ${p.status}`);
    });

    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
