const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from src/.env
dotenv.config({ path: './src/.env' });

// We need the User model
const User = require('./src/models/User');

const seedUsers = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const users = [
      {
        username: 'AdminUser',
        email: 'admin@pronosbox.com',
        password: 'admin123',
        role: 'admin',
        isPro: true,
        walletBalance: 1000
      },
      {
        username: 'ProUser',
        email: 'pro@pronosbox.com',
        password: 'pro123',
        role: 'user',
        isPro: true,
        walletBalance: 500
      },
      {
        username: 'StandardUser',
        email: 'user@pronosbox.com',
        password: 'user123',
        role: 'user',
        isPro: false,
        walletBalance: 50
      }
    ];

    console.log('Clearing old test accounts if they exist...');
    for (const u of users) {
      await User.deleteOne({ email: u.email });
    }

    console.log('Creating test accounts...');
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created: ${user.email} (${user.role}${user.isPro ? ', pro' : ''})`);
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedUsers();
