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

  const channel = await Channel.findOne({ name: { $regex: /Talakaka/i } });
  if (channel) {
    console.log('Found Channel:', JSON.stringify({
      id: channel._id,
      name: channel.name,
      owner: channel.owner,
      members: channel.members
    }, null, 2));

    // Inspect user's channelsJoined
    const users = await User.find({ role: 'admin' });
    console.log('Admin Users count:', users.length);
    for (const u of users) {
      console.log(`User: ${u.username} (${u._id}), Joined Channels:`, u.channelsJoined);
    }
  } else {
    console.log('Channel not found');
  }

  await mongoose.disconnect();
}

run().catch(console.error);
