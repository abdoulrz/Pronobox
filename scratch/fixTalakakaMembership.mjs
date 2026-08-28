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

  const userId = '6a203a5af834315b8b8d5827';
  const channelId = '6a628ef7dfc6c7808a2f684b';

  const userRes = await User.findByIdAndUpdate(userId, {
    $pull: { channelsJoined: new mongoose.Types.ObjectId(channelId) }
  }, { new: true });

  const channelRes = await Channel.findByIdAndUpdate(channelId, {
    $pull: { members: new mongoose.Types.ObjectId(userId) }
  }, { new: true });

  console.log('User channelsJoined after fix:', userRes ? userRes.channelsJoined : 'User not found');
  console.log('Channel members after fix:', channelRes ? channelRes.members : 'Channel not found');

  await mongoose.disconnect();
}

run().catch(console.error);
