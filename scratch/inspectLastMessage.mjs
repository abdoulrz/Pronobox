import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../src/.env') });

import Channel from '../src/models/Channel.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const channels = await Channel.find({});
  for (const c of channels) {
    console.log(`Channel: ${c.name} -> lastMessage: ${JSON.stringify(c.lastMessage)}`);
  }
  await mongoose.disconnect();
}

run().catch(console.error);
