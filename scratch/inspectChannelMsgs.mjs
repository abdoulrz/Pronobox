import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../../Documents/Pronobox/pronobox_codebase/src/.env') });

import Channel from '../../../../Documents/Pronobox/pronobox_codebase/src/models/Channel.js';

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  const channels = await Channel.find({ name: /DOOOBI/i });
  for (const ch of channels) {
    console.log('Channel:', ch.name);
    console.log('lastMessage:', ch.lastMessage);
    const pronoMsgs = (ch.messages || []).filter(m => String(m.text || '').includes('vs'));
    for (const m of pronoMsgs) {
      console.log('--- Message text:');
      console.log(JSON.stringify(m.text));
    }
  }
  await mongoose.disconnect();
}

inspect().catch(console.error);
