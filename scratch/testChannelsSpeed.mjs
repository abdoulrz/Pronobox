import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../src/.env') });

import Channel from '../src/models/Channel.js';
import Prono from '../src/models/Prono.js';
import User from '../src/models/User.js';

async function benchmark() {
  const start = Date.now();
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB in', Date.now() - start, 'ms');

  const fetchStart = Date.now();
  const channels = await Channel.find()
    .populate('owner', '_id username avatar isCertified role')
    .populate('members', '_id username avatar');
  console.log('Fetched channels in', Date.now() - fetchStart, 'ms. Total channels:', channels.length);

  const pronosStart = Date.now();
  const allDbPronos = await Prono.find().lean();
  console.log('Fetched pronos in', Date.now() - pronosStart, 'ms. Total pronos:', allDbPronos.length);

  await mongoose.disconnect();
}

benchmark().catch(console.error);
