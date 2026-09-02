import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../src/.env') });

import User from '../src/models/User.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admins = await User.find({ role: 'admin' });
  console.log('Admins in DB:', admins.map(a => ({ id: a._id, username: a.username, email: a.email })));
  await mongoose.disconnect();
}

run().catch(console.error);
