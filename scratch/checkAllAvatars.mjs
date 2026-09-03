import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../../Documents/Pronobox/pronobox_codebase/src/.env') });

import Channel from '../../../../Documents/Pronobox/pronobox_codebase/src/models/Channel.js';
import User from '../../../../Documents/Pronobox/pronobox_codebase/src/models/User.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('--- CHANNELS ---');
  const channels = await Channel.find({});
  for (const ch of channels) {
    console.log(`Channel "${ch.name}": avatar = ${ch.avatar}`);
  }

  console.log('\n--- USERS ---');
  const users = await User.find({});
  for (const u of users) {
    if (u.avatar && u.avatar.includes('upload')) {
      console.log(`User "${u.username}": avatar = ${u.avatar}`);
    }
  }

  await mongoose.disconnect();
}

check().catch(console.error);
