import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './src/.env' });

import User from '../src/models/User.js';
import Channel from '../src/models/Channel.js';
import Prono from '../src/models/Prono.js';
import Debate from '../src/models/Debate.js';

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pronosbox";

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to DB!");
    
    const userCount = await User.countDocuments();
    const channelCount = await Channel.countDocuments();
    const pronoCount = await Prono.countDocuments();
    const debateCount = await Debate.countDocuments();
    
    console.log(`Counts: Users=${userCount}, Channels=${channelCount}, Pronos=${pronoCount}, Debates=${debateCount}`);
    
    const channels = await Channel.find().populate('owner', 'username').lean();
    console.log("\nChannels in DB:");
    channels.forEach(ch => {
      console.log(`- ID: ${ch._id || ch.id}, Name: "${ch.name}", Premium: ${ch.premium}, Owner: ${ch.owner?.username}, Members Count: ${ch.members?.length || 0}, Messages Count: ${ch.messages?.length || 0}`);
      if (ch.messages && ch.messages.length > 0) {
        console.log(`  Last Message: "${ch.lastMessage}"`);
        ch.messages.forEach((msg, idx) => {
          console.log(`    Msg ${idx}: text="${msg.text}", time="${msg.time}", pronoStatus="${msg.pronoStatus}", pronoMatchId="${msg.pronoMatchId}"`);
        });
      }
    });

    const pronos = await Prono.find().lean();
    console.log("\nPronos in DB:");
    pronos.forEach(p => {
      console.log(`- ID: ${p._id || p.id}, Match: "${p.homeTeamName} vs ${p.awayTeamName}", Date: ${p.matchDate}, Status: ${p.status}, CreatedAt: ${p.createdAt}`);
    });
    
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
