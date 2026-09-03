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
    const docs = await mongoose.connection.db.collection(col.name).find({
      $or: [
        { avatar: /1781188325830/i },
        { image: /1781188325830/i },
        { imageUrl: /1781188325830/i },
        { content: /1781188325830/i }
      ]
    }).toArray();
    if (docs.length > 0) {
      console.log(`Found in collection ${col.name}:`, docs.map(d => ({ _id: d._id, name: d.name || d.title, avatar: d.avatar, image: d.image, imageUrl: d.imageUrl })));
    }
  }
  await mongoose.disconnect();
}

search().catch(console.error);
