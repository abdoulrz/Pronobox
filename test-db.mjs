import mongoose from 'mongoose';
import Channel from './src/models/Channel.js';

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/pronobox');
  const channel = await Channel.findOne();
  console.log('Channel messages:', channel.messages);
  mongoose.disconnect();
}

test().catch(console.error);
