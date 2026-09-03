import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../../Documents/Pronobox/pronobox_codebase/src/.env') });

async function search() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    const docs = await mongoose.connection.db.collection(col.name).find({}).toArray();
    for (const doc of docs) {
      const str = JSON.stringify(doc);
      if (str.includes('1781188325830')) {
        console.log(`Found in collection "${col.name}" id ${doc._id}:`);
        // Find keys containing it
        const match = str.match(/[^"]*1781188325830[^"]*/g);
        console.log('Matches:', match);
      }
      if (str.includes('17802674')) {
        console.log(`Found 17802674 in collection "${col.name}" id ${doc._id}:`);
        const match = str.match(/[^"]*17802674[^"]*/g);
        console.log('Matches:', match);
      }
    }
  }
  await mongoose.disconnect();
}

search().catch(console.error);
