import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../../Documents/Pronobox/pronobox_codebase/src/.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const c of collections) {
    const all = await mongoose.connection.db.collection(c.name).find({}).toArray();
    for (const doc of all) {
      const s = JSON.stringify(doc);
      if (s.includes('1781188325830') || s.includes('1781342823767') || s.includes('1781429088386')) {
        console.log(`MATCH in collection "${c.name}", doc _id: ${doc._id}`);
        console.log(s.slice(0, 300));
      }
    }
  }
  await mongoose.disconnect();
}

check().catch(console.error);
