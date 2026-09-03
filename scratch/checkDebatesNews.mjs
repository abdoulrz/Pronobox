import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../../Documents/Pronobox/pronobox_codebase/src/.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const debates = await mongoose.connection.db.collection('debates').find({}).toArray();
  console.log('--- DEBATES (', debates.length, ') ---');
  for (const d of debates) {
    if (d.images && d.images.length) {
      console.log('Debate image:', d.images);
    }
  }

  const news = await mongoose.connection.db.collection('news').find({}).toArray();
  console.log('--- NEWS (', news.length, ') ---');
  for (const n of news) {
    if (n.image) console.log('News image:', n.image);
  }

  await mongoose.disconnect();
}

check().catch(console.error);
