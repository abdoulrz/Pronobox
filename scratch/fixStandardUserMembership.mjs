import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../src/.env') });

import Channel from '../src/models/Channel.js';
import User from '../src/models/User.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const standardUserId = '6a203a5af834315b8b8d5829';
  const channelId = '6a628ef7dfc6c7808a2f684b';

  // Remove StandardUser from Talakaka Pro members
  const channelRes = await Channel.findByIdAndUpdate(channelId, {
    $pull: { members: new mongoose.Types.ObjectId(standardUserId) }
  }, { returnDocument: 'after' });

  // Remove Talakaka Pro from StandardUser's channelsJoined
  const userRes = await User.findByIdAndUpdate(standardUserId, {
    $pull: { channelsJoined: new mongoose.Types.ObjectId(channelId) }
  }, { returnDocument: 'after' });

  console.log('Channel members after fix:', channelRes ? channelRes.members.map(m => m.toString()) : 'NOT FOUND');
  console.log('User channelsJoined after fix:', userRes ? userRes.channelsJoined.map(c => c.toString()) : 'NOT FOUND');

  await mongoose.disconnect();
}

run().catch(console.error);
