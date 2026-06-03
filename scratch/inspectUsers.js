import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: './src/.env' });

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pronosbox";

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected successfully to database!");
    const users = await User.find({}, { password: 0 });
    console.log("User accounts in the DB:");
    users.forEach(u => {
      console.log(`- Username: ${u.username}, Email: ${u.email}, Role: ${u.role}, isPro: ${u.isPro}`);
    });
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
