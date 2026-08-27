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

  const pronos = await Prono.find({
    $or: [
      { freeConfidence: { $gt: 0, $lte: 5 } },
      { premiumConfidence: { $gt: 0, $lte: 5 } }
    ]
  });
  console.log(`Found ${pronos.length} pronos to migrate`);

  for (const prono of pronos) {
    const oldFree = prono.freeConfidence;
    const oldPremium = prono.premiumConfidence;

    if (prono.freeConfidence > 0 && prono.freeConfidence <= 5) {
      prono.freeConfidence = prono.freeConfidence * 20;
    }
    if (prono.premiumConfidence > 0 && prono.premiumConfidence <= 5) {
      prono.premiumConfidence = prono.premiumConfidence * 20;
    }

    await prono.save();
    console.log(`Migrated prono ${prono._id} (${prono.homeTeamName} vs ${prono.awayTeamName}): free ${oldFree} -> ${prono.freeConfidence}, premium ${oldPremium} -> ${prono.premiumConfidence}`);
  }

  await mongoose.disconnect();
  console.log('Migration finished');
}

run().catch(console.error);
