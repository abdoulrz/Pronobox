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

  const ch = await Channel.findOne({ name: /Talakaka/i });
  console.log('Channel:', ch.name, 'Owner:', ch.owner?.toString());
  console.log('Members:', ch.members.map(m => m.toString()));

  const users = await User.find({}, '_id username role channelsJoined');
  for (const u of users) {
    console.log(`User: ${u.username} (${u._id}) role: ${u.role} channels: [${u.channelsJoined.map(c => c.toString()).join(', ')}]`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
