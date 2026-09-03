import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../../Documents/Pronobox/pronobox_codebase/src/.env') });

import Channel from '../../../../Documents/Pronobox/pronobox_codebase/src/models/Channel.js';
import Prono from '../../../../Documents/Pronobox/pronobox_codebase/src/models/Prono.js';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const channels = await Channel.find({ name: /DOOOBI/i });
  const allDbPronos = await Prono.find().lean();
  const cleanStr = (s) => String(s || '').replace(/[⚽🎯🏆💡]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim();

  for (const ch of channels) {
    const channelPronos = new Map();
    // 1. check allPronosPool
    for (const p of allDbPronos) {
      if (p.homeTeamName.includes('RÉSULTAT')) {
        console.log('FOUND IN PRONO MODEL:', p.homeTeamName);
      }
    }
    // 2. check ch.messages
    for (const msg of ch.messages) {
      const text = String(msg.text || '');
      if (text.includes(' vs ') || text.includes('PRONOSTIC')) {
        let home = '';
        let away = '';
        if (text.includes(' vs ')) {
          const parts = text.split('\n')[0].split(' — ')[0].split(' - ')[0].split(' vs ');
          if (parts.length >= 2) {
            const rawHome = parts[0].replace(/[⚽🎯🏆💡]/g, '').trim();
            home = rawHome.includes(':') ? rawHome.split(':').pop().trim() : rawHome;
            away = parts[1].replace(/[⚽🎯🏆💡]/g, '').split('(')[0].trim();
          }
        }
        if (home.includes('RÉSULTAT')) {
          console.log('HOME STILL HAS RESULTAT:', home, 'FROM TEXT:', text.split('\n')[0]);
        }
      }
    }
  }
  await mongoose.disconnect();
}

test().catch(console.error);
