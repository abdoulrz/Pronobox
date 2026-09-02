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

  const admin = await User.findOne({ username: '@Pronosbox Officiel' });
  if (!admin) {
    console.error('Admin @Pronosbox Officiel not found');
    await mongoose.disconnect();
    return;
  }

  let officialChannel = await Channel.findOne({ name: 'PronosBox Officiel' });
  if (!officialChannel) {
    officialChannel = new Channel({
      name: 'PronosBox Officiel',
      description: 'Le canal officiel de la plateforme PronosBox. Pronostics officiels, annonces et actualités de la communauté.',
      premium: false,
      owner: admin._id,
      members: [admin._id],
      avatar: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      lastMessage: 'Bienvenue sur le canal officiel PronosBox ! ⚽🎯'
    });
    await officialChannel.save();
    console.log('Created official channel:', officialChannel._id);
  } else {
    console.log('Official channel already exists:', officialChannel._id);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
