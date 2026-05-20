/* eslint-env node */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import Parser from 'rss-parser';
import User from './models/User.js';
import Transaction from './models/Transaction.js';
import Channel from './models/Channel.js';
import Debate from './models/Debate.js';
import BetEduc from './models/BetEduc.js';
import Prono from './models/Prono.js';
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Statically serve uploaded files from the root /uploads folder
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection Options
const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  retryWrites: true,
  retryReads: true
};

// Standardize JSON response to include 'id' and remove '_id' and '__v'
mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Connect to MongoDB with improved error handling and retry logic
const connectWithRetry = () => {
  console.log('Attempting to connect to MongoDB...');
  // Clean and validate MongoDB URI
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('MongoDB URI is not defined in environment variables!');
    process.exit(1);
  }
  mongoose.connect(mongoURI, mongoOptions).
  then(() => {
    console.log('MongoDB connected successfully!');
    // Initialize mock data after successful connection
    initializeMockData();
  }).
  catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected! Attempting to reconnect...');
  setTimeout(connectWithRetry, 5000);
});
mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected!');
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware to require Pro or Admin status
const requireProOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  if (req.user.role === 'admin' || req.user.isPro) {
    next();
  } else {
    res.status(403).json({ message: 'This action requires a Pro or Admin account' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'This action requires an Admin account' });
  }
};

// Routes
// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create new user
    const user = new User({
      username,
      email,
      password
    });
    await user.save();
    // Generate token with role and isPro status
    const token = jwt.sign(
      { id: user._id, role: user.role, isPro: user.isPro },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isPro: user.isPro,
        avatar: user.avatar,
        walletBalance: user.walletBalance,
        unlockedResources: user.unlockedResources || []
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isPro: user.isPro,
        avatar: user.avatar,
        walletBalance: user.walletBalance,
        unlockedResources: user.unlockedResources || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Football API proxy route
app.get('/api/football/matches', async (req, res) => {
  try {
    const { date } = req.query; // Expecting YYYY-MM-DD
    
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required (YYYY-MM-DD)' });
    }

    console.log(`Fetching matches for date: ${date}`);
    
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      params: { date },
      headers: {
        'x-apisports-key': '9a068a21856b2e7f20dedff6b4322352'
      }
    });
    
    console.log(`API-Football response status: ${response.status}`);
    console.log(`API-Football response data count: ${response.data.response?.length || 0}`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching football data:', error.message);
    res.status(500).json({ message: 'Error fetching football data' });
  }
});

// Fetch detailed match information
app.get('/api/football/match/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching match details for ID: ${id}`);
    
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      params: { id },
      headers: {
        'x-apisports-key': '9a068a21856b2e7f20dedff6b4322352'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching match ${req.params.id}:`, error.message);
    res.status(500).json({ message: 'Error fetching match details' });
  }
});

// Fetch league standings
app.get('/api/football/standings/:league/:season', async (req, res) => {
  try {
    const { league, season } = req.params;
    console.log(`Fetching standings for league: ${league}, season: ${season}`);
    
    const response = await axios.get('https://v3.football.api-sports.io/standings', {
      params: { league, season },
      headers: {
        'x-apisports-key': '9a068a21856b2e7f20dedff6b4322352'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching standings for ${req.params.league}:`, error.message);
    res.status(500).json({ message: 'Error fetching league standings' });
  }
});

// Fetch league fixtures
app.get('/api/football/fixtures/:league/:season', async (req, res) => {
  try {
    const { league, season } = req.params;
    console.log(`Fetching fixtures for league: ${league}, season: ${season}`);
    
    // Free plans do not have access to the 'next' parameter, so we fetch all fixtures for the season.
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      params: { league, season },
      headers: {
        'x-apisports-key': '9a068a21856b2e7f20dedff6b4322352'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching fixtures for ${req.params.league}:`, error.message);
    res.status(500).json({ message: 'Error fetching league fixtures' });
  }
});

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
});

app.get('/api/news', async (req, res) => {
  try {
    const feed = await parser.parseURL('https://www.sports.fr/football/feed/');
    
    const items = feed.items.map(item => {
      const content = item.content || '';
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      const match = imgRegex.exec(content);
      
      const image = item.enclosure?.url || (match ? match[1] : 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=400&h=250');
      
      return {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.contentSnippet || item.content,
        image: image
      };
    });
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching RSS feed:', error.message);
    res.status(500).json({ message: 'Error fetching news' });
  }
});

// BET-EDUC routes
app.get('/api/beteduc', async (req, res) => {
  try {
    const resources = await BetEduc.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/beteduc', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const resource = new BetEduc(req.body);
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/beteduc/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const resource = await BetEduc.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/beteduc/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const resource = await BetEduc.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post a comment on a BET-EDUC resource
app.post('/api/beteduc/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Le texte du commentaire est requis.' });
    }
    
    // Find the user to get their username and avatar
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    
    const resource = await BetEduc.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Ressource non trouvée.' });
    
    if (!resource.comments) {
      resource.comments = [];
    }
    
    resource.comments.push({
      username: user.username,
      avatar: user.avatar || '',
      text: text.trim(),
      createdAt: new Date()
    });
    
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    console.error('Error adding comment to beteduc:', error);
    res.status(500).json({ message: error.message });
  }
});

// Post a reply to a comment on a BET-EDUC resource
app.post('/api/beteduc/:id/comments/:commentId/replies', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Le texte de la réponse est requis.' });
    }
    
    // Find the user to get their username and avatar
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    
    const resource = await BetEduc.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Ressource non trouvée.' });
    
    const comment = resource.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé.' });
    
    if (!comment.replies) {
      comment.replies = [];
    }
    
    comment.replies.push({
      username: user.username,
      avatar: user.avatar || '',
      text: text.trim(),
      createdAt: new Date()
    });
    
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    console.error('Error adding reply to beteduc comment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Secure API for uploading files locally using Base64 strings (Admin-only)
app.post('/api/upload', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ message: 'Le nom du fichier et les données Base64 sont requis.' });
    }

    // Generate unique, safe filename
    const cleanFilename = Date.now() + '_' + filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uploadsDir = path.join(process.cwd(), 'uploads');

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, cleanFilename);
    const buffer = Buffer.from(base64Data, 'base64');

    // Write file safely and asynchronously
    await fs.promises.writeFile(filePath, buffer);

    res.status(201).json({ url: `/uploads/${cleanFilename}` });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Erreur lors du téléversement du fichier.' });
  }
});

// Secure API for high-speed local binary stream uploading (Admin-only)
app.post('/api/upload-binary', authenticateToken, requireAdmin, express.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
  try {
    const filename = req.query.filename;
    if (!filename) {
      return res.status(400).json({ message: 'Le paramètre filename est requis.' });
    }

    // Generate unique, safe filename
    const cleanFilename = Date.now() + '_' + filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uploadsDir = path.join(process.cwd(), 'uploads');

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, cleanFilename);

    // Save binary buffer directly to disk asynchronously
    await fs.promises.writeFile(filePath, req.body);

    res.status(201).json({ url: `/uploads/${cleanFilename}` });
  } catch (error) {
    console.error('Binary upload error:', error);
    res.status(500).json({ message: 'Erreur lors du téléversement binaire.' });
  }
});

// ----------------------------------------------------------------------
// Pronos API
// ----------------------------------------------------------------------

app.get('/api/pronos', async (req, res) => {
  try {
    // Use createdAt for sorting since matchDate might not be in the schema
    const pronos = await Prono.find().sort({ createdAt: -1 });
    res.json(pronos);
  } catch (err) {
    console.error('Error fetching pronos:', err);
    res.status(500).json({ error: 'Failed to fetch pronos' });
  }
});

app.get('/api/pronos/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    console.log(`Searching for prono with matchId: ${matchId}`);
    
    // Find by either numeric or string matchId to be safe
    const prono = await Prono.findOne({ 
      $or: [
        { matchId: parseInt(matchId) },
        { matchId: matchId }
      ]
    });
    
    if (!prono) {
      console.log(`No prono found for matchId: ${matchId}`);
      return res.status(404).json({ error: 'Prono not found' });
    }
    
    res.json(prono);
  } catch (err) {
    console.error('Error fetching single prono:', err);
    res.status(500).json({ error: 'Failed to fetch prono' });
  }
});

app.post('/api/pronos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const newProno = new Prono(req.body);
    await newProno.save();
    res.status(201).json(newProno);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create prono' });
  }
});

app.put('/api/pronos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const prono = await Prono.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!prono) return res.status(404).json({ error: 'Prono not found' });
    res.json(prono);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update prono' });
  }
});

app.delete('/api/pronos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const prono = await Prono.findByIdAndDelete(req.params.id);
    if (!prono) return res.status(404).json({ error: 'Prono not found' });
    res.json({ message: 'Prono deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete prono' });
  }
});

// User routes
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    // Don't allow updating sensitive fields
    delete updates.password;
    delete updates.role;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/withdrawals', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const withdrawals = await Transaction.find({ type: 'withdrawal' }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/withdrawals/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const { status } = req.body;
    const withdrawal = await Transaction.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/support/messages', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    // This is a simplified support message system
    // In a real app, you'd have a SupportMessage model
    res.json([]); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Transaction routes
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { amount, type, description, method, itemId, itemName, recipient } = req.body;
    const transaction = new Transaction({
      user: req.user.id,
      amount,
      type,
      description,
      method,
      itemId,
      itemName,
      recipient
    });
    await transaction.save();
    // Update user wallet balance
    const user = await User.findById(req.user.id);
    if (type === 'recharge') {
      user.walletBalance += amount;
    } else if (type === 'withdrawal' || type === 'subscription' || type === 'pro') {
      user.walletBalance -= amount;
    } else if (type === 'product') {
      // Only deduct from wallet balance if paid using wallet
      if (method === 'wallet') {
        user.walletBalance -= amount;
      }
      // Persistently unlock the resource for the user
      if (itemId) {
        if (!user.unlockedResources) {
          user.unlockedResources = [];
        }
        if (!user.unlockedResources.includes(itemId)) {
          user.unlockedResources.push(itemId);
        }
      }
    }
    // Update user Pro status if applicable
    if (type === 'subscription' || type === 'pro') {
      user.isPro = true;
    }
    await user.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Channel routes
app.post('/api/channels', authenticateToken, requireProOrAdmin, async (req, res) => {
  try {
    const { name, description, premium, allowComments, subscriptionPrice } = req.body;
    const channel = new Channel({
      name,
      description,
      premium,
      adminOnly: premium ? true : !allowComments,
      allowComments: premium ? false : allowComments,
      owner: req.user.id,
      members: [req.user.id],
      subscriptionPrice: premium ? subscriptionPrice : 0,
      shareLink: `https://pronosbox.com/canal/${Math.floor(Math.random() * 1000) + 100}`
    });
    await channel.save();
    // Add channel to user's joined channels
    await User.findByIdAndUpdate(req.user.id, {
      $push: { channelsJoined: channel._id }
    });
    res.status(201).json(channel);
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/channels', async (req, res) => {
  try {
    const channels = await Channel.find().
    populate('owner', 'username avatar').
    populate('members', 'username avatar');
    res.json(channels);
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/channels/:id', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).
    populate('owner', 'username avatar').
    populate('members', 'username avatar').
    populate('messages.user', 'username avatar role');
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    res.json(channel);
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/channels/:id/join', authenticateToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    // Check if user is already a member
    if (channel.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member' });
    }
    // Add user to channel members
    channel.members.push(req.user.id);
    await channel.save();
    // Add channel to user's joined channels
    await User.findByIdAndUpdate(req.user.id, {
      $push: { channelsJoined: channel._id }
    });
    res.json({ message: 'Joined channel successfully' });
  } catch (error) {
    console.error('Join channel error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/channels/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    // Check if user can post
    const isAdmin = req.user.role === 'admin';
    const isOwner = channel.owner.toString() === req.user.id;
    if (channel.adminOnly && !isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Only admins can post in this channel' });
    }
    // Add message
    channel.messages.push({
      user: req.user.id,
      text
    });
    // Update statistics
    channel.statistics.messagesSent += 1;
    await channel.save();
    // Get the added message with user details
    const addedMessage = await Channel.findById(req.params.id).
    select('messages').
    populate('messages.user', 'username avatar role');
    const newMessage = addedMessage.messages[addedMessage.messages.length - 1];
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Debate routes
app.post('/api/debates', authenticateToken, requireProOrAdmin, async (req, res) => {
  try {
    const isChannelOwner = await Channel.exists({ owner: req.user.id });
    if (!isChannelOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Seuls les propriétaires de canaux peuvent créer un débat' });
    }
    const { title, description, images, category } = req.body;
    const debate = new Debate({
      title,
      description,
      images: images || [],
      category: category || 'Général',
      author: req.user.id
    });
    await debate.save();
    const populatedDebate = await Debate.findById(debate._id).populate('author', 'username avatar');
    res.status(201).json(populatedDebate);
  } catch (error) {
    console.error('Create debate error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/debates', async (req, res) => {
  try {
    const debates = await Debate.find()
      .populate('author', 'username avatar')
      .populate('messages.user', 'username avatar')
      .populate('messages.replies.user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(debates);
  } catch (error) {
    console.error('Get debates error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/debates/:id', authenticateToken, async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });
    if (debate.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { title, description, category, images } = req.body;
    if (title) debate.title = title;
    if (description) debate.description = description;
    if (category) debate.category = category;
    if (images) debate.images = images;
    
    await debate.save();
    const updated = await Debate.findById(debate._id).populate('author', 'username avatar');
    res.json(updated);
  } catch (error) {
    console.error('Update debate error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/debates/:id', authenticateToken, async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });
    if (debate.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Mongoose remove() is deprecated in newer versions, use deleteOne
    await Debate.deleteOne({ _id: req.params.id });
    res.json({ message: 'Debate deleted' });
  } catch (error) {
    console.error('Delete debate error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/debates/:id/like', authenticateToken, async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });
    
    const userIndex = debate.likedBy.indexOf(req.user.id);
    if (userIndex === -1) {
      debate.likedBy.push(req.user.id);
      debate.likes += 1;
    } else {
      debate.likedBy.splice(userIndex, 1);
      debate.likes -= 1;
    }
    await debate.save();
    res.json({ likes: debate.likes, likedBy: debate.likedBy });
  } catch (error) {
    console.error('Like debate error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/debates/:id/messages', authenticateToken, async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });
    
    debate.messages.push({
      user: req.user.id,
      text: req.body.text
    });
    
    const isParticipant = debate.messages.some(msg => msg.user.toString() === req.user.id) || debate.author.toString() === req.user.id;
    if (!isParticipant) {
       debate.participants += 1; 
    }
    await debate.save();
    const updated = await Debate.findById(debate._id)
      .populate('messages.user', 'username avatar')
      .populate('author', 'username avatar');
    res.status(201).json(updated.messages[updated.messages.length - 1]);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Initialize mock data
const initializeMockData = async () => {
  try {
    // Check if we already have users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Initializing mock data...');
      // Create mock users
      const adminUser = new User({
        username: 'Admin',
        email: 'admin@pronosbox.com',
        password: 'admin123',
        role: 'admin',
        isPro: true,
        walletBalance: 1000,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
      });
      const regularUser = new User({
        username: 'User',
        email: 'user@pronosbox.com',
        password: 'user123',
        role: 'user',
        isPro: false,
        walletBalance: 50,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
      });
      const proUser = new User({
        username: 'ProUser',
        email: 'pro@pronosbox.com',
        password: 'pro123',
        role: 'user',
        isPro: true,
        walletBalance: 250,
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
      });
      await Promise.all([adminUser.save(), regularUser.save(), proUser.save()]);
      // Create mock channels
      const officialChannel = new Channel({
        name: 'PronosBox Officiel',
        description: 'Canal officiel de PronosBox - Actualités et annonces',
        premium: false,
        adminOnly: true,
        allowComments: false,
        owner: adminUser._id,
        members: [adminUser._id, regularUser._id, proUser._id],
        avatar: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        shareLink: 'https://pronosbox.com/canal/1',
        statistics: {
          totalViews: 45230,
          activeUsers: 8750,
          messagesSent: 2,
          averageEngagement: 75.4
        },
        messages: [
        {
          user: adminUser._id,
          text: 'Bienvenue sur le canal officiel de PronosBox! Retrouvez ici toutes les actualités et annonces importantes.'
        },
        {
          user: adminUser._id,
          text: "Nous avons ajouté de nouveaux pronos pour les matchs de ce soir. N'hésitez pas à les consulter!"
        }]

      });
      const premiumChannel = new Channel({
        name: 'Pronos Premium',
        description: 'Accès exclusif aux analyses détaillées par nos experts',
        premium: true,
        adminOnly: true,
        allowComments: false,
        owner: adminUser._id,
        members: [adminUser._id, proUser._id],
        subscriptionPrice: 9.99,
        avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        shareLink: 'https://pronosbox.com/canal/2',
        statistics: {
          totalViews: 28450,
          activeUsers: 3200,
          messagesSent: 1,
          averageEngagement: 82.7
        },
        messages: [
        {
          user: adminUser._id,
          text: 'Nouveau prono premium disponible: PSG vs Marseille. Notre analyse suggère un match à plus de 3.5 buts avec une confiance de 85%.'
        }]

      });
      const ligue1Channel = new Channel({
        name: 'Communauté Ligue 1',
        description: 'Discussions et analyses sur la Ligue 1',
        premium: false,
        adminOnly: false,
        allowComments: true,
        owner: proUser._id,
        members: [adminUser._id, regularUser._id, proUser._id],
        avatar: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        shareLink: 'https://pronosbox.com/canal/3',
        statistics: {
          totalViews: 32180,
          activeUsers: 5430,
          messagesSent: 4,
          averageEngagement: 68.2
        },
        messages: [
        {
          user: proUser._id,
          text: 'Analyse du match Lyon-Monaco (2-1): Lyon a été plus efficace avec 5 tirs cadrés contre 3 pour Monaco malgré une possession de balle inférieure (42%).'
        },
        {
          user: proUser._id,
          text: "Prochain match important: Lyon vs Marseille samedi à 21h00. Un duel qui pourrait être décisif pour la course à l'Europe."
        },
        {
          user: regularUser._id,
          text: 'Merci pour cette analyse! Pensez-vous que Lyon est en mesure de se qualifier pour la Ligue des Champions cette saison?'
        },
        {
          user: proUser._id,
          text: 'Lyon a encore des matchs difficiles à jouer, mais je leur donne 60% de chances de finir dans le top 4. Tout dépendra de leur régularité.'
        }]

      });
      await Promise.all([officialChannel.save(), premiumChannel.save(), ligue1Channel.save()]);
      // Create mock transactions
      const transactions = [
      {
        user: regularUser._id,
        amount: 50,
        type: 'recharge',
        description: 'Recharge de portefeuille',
        status: 'completed',
        method: 'card'
      },
      {
        user: proUser._id,
        amount: 29.99,
        type: 'subscription',
        description: 'Abonnement Premium - Mensuel',
        status: 'completed',
        method: 'wallet'
      },
      {
        user: proUser._id,
        amount: 20,
        type: 'withdrawal',
        description: 'Retrait vers carte bancaire',
        status: 'completed',
        method: 'card'
      },
      {
        user: regularUser._id,
        amount: 24.99,
        type: 'product',
        description: 'Achat: Stratégies avancées de paris',
        status: 'completed',
        method: 'wallet'
      }];

      await Transaction.insertMany(transactions);
      
      // Create mock debates
      const debates = [
        {
          title: 'La VAR a-t-elle amélioré le football?',
          description: "Débattez sur l'impact de la technologie d'assistance vidéo dans le football moderne.",
          images: [
            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            'https://images.unsplash.com/photo-1508098682722-e99c643e7f76?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
          ],
          category: 'Arbitrage',
          participants: 3,
          author: adminUser._id,
          likes: 2,
          likedBy: [regularUser._id, proUser._id],
          messages: [
            {
              user: adminUser._id,
              text: "La VAR a considérablement réduit les erreurs d'arbitrage flagrantes, mais ralentit trop le jeu.",
              likes: 1,
              likedBy: [regularUser._id]
            },
            {
              user: regularUser._id,
              text: 'Je préférais le football avant la VAR. Les erreurs font partie du jeu et créaient des moments de discussion passionnés.',
            }
          ]
        }
      ];
      await Debate.insertMany(debates);
      
      console.log('Mock data initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

// Initiate MongoDB connection
connectWithRetry();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed gracefully');
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
});