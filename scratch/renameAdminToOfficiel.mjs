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
  console.log('Connected to DB');

  const res = await User.updateMany(
    { username: { $in: ['@Pronosbox', 'Admin'] }, role: 'admin' },
    { $set: { username: '@Pronosbox Officiel' } }
  );

  console.log('Migration output:', res);

  const updatedAdmins = await User.find({ role: 'admin' });
  console.log('Admins now:', updatedAdmins.map(a => ({ id: a._id, username: a.username })));

  await mongoose.disconnect();
}

run().catch(console.error);
