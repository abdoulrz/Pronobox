import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../src/.env') });

import Prono from '../src/models/Prono.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const prono = await Prono.findOne({
    homeTeamName: { $regex: /Lyon/i },
    awayTeamName: { $regex: /Fenerbah/i }
  });
  
  if (prono) {
    console.log('Found Prono:', JSON.stringify(prono, null, 2));
  } else {
    console.log('Prono not found');
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
