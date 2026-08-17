/* eslint-env node */
import './instrument.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import Parser from 'rss-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import User from './models/User.js';

const googleClient = new OAuth2Client('380256594201-dnalojsu0p5266j4mhjlcg8fnapd5rf3.apps.googleusercontent.com');
import Transaction from './models/Transaction.js';
import Channel from './models/Channel.js';
import Debate from './models/Debate.js';
import BetEduc from './models/BetEduc.js';
import Prono from './models/Prono.js';
import multer from 'multer';

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const cleanFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + '_' + cleanFilename);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit
const app = express();

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// Secure backend with Helmet (Security Headers)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "http:", "https://images.unsplash.com"],
      connectSrc: ["'self'", "https:", "http:", "wss:", "ws:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:", "http:"],
      frameSrc: ["'self'", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// API Rate Limiting to prevent brute force and DDoS attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: { message: 'Trop de requêtes effectuées depuis cette IP, veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication requests per windowMs
  message: { message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to routes
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
      'http://localhost:5173', 
      'http://localhost:3000', 
      'http://127.0.0.1:5173',
      'https://pronosbox.com',
      'https://www.pronosbox.com',
      'https://api.pronosbox.com',
      'http://pronosbox.com',
      'http://www.pronosbox.com',
      'http://api.pronosbox.com'
    ];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy (Unauthorized Domain)'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Statically serve uploaded files from the root /uploads folder
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/api/uploads', express.static(uploadsDir)); // Also serve at /api/uploads for Nginx proxy compatibility

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
    ret.id = ret._id ? ret._id.toString() : undefined;
    // Don't delete _id because populated fields might need it
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

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: '380256594201-dnalojsu0p5266j4mhjlcg8fnapd5rf3.apps.googleusercontent.com'
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google account' });
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Generate unique username
      let baseUsername = (name || email.split('@')[0])
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 20);
      if (!baseUsername) baseUsername = 'User';

      let username = baseUsername;
      let userExists = await User.findOne({ username });
      let counter = 1;
      while (userExists) {
        username = `${baseUsername}${counter}`;
        userExists = await User.findOne({ username });
        counter++;
      }

      // Generate secure random password
      const randomPassword = crypto.randomBytes(16).toString('hex');

      user = new User({
        username,
        email: email.toLowerCase(),
        password: randomPassword,
        avatar: picture || undefined,
        isPro: false
      });
      await user.save();
    } else {
      // Update last login
      user.lastLogin = Date.now();
      // If user's avatar is the default Unsplash image, we can update it with the Google picture
      if (picture && (!user.avatar || user.avatar.includes('unsplash.com'))) {
        user.avatar = picture;
      }
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, isPro: user.isPro },
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
    console.error('Google Auth Route Error:', error);
    res.status(500).json({ message: 'Authentication failed: ' + error.message });
  }
});

app.delete('/api/channels/:id/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    
    const messageIndex = channel.messages.findIndex(m => m._id.toString() === req.params.messageId);
    if (messageIndex === -1) return res.status(404).json({ message: 'Message not found' });

    const message = channel.messages[messageIndex];
    const isAdmin = req.user.role === 'admin';
    const isOwner = channel.owner.toString() === req.user.id;
    const isAuthor = message.user.toString() === req.user.id;

    if (!isAdmin && !isOwner && !isAuthor) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    channel.messages.splice(messageIndex, 1);
    await channel.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: error.message });
  }
});

// Football API proxy cache
const matchesCache = Object.create(null);
const MATCHES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Team names English to French translation dictionary
const TEAM_TRANSLATIONS = {
  // Europe
  'England': 'Angleterre',
  'Germany': 'Allemagne',
  'France': 'France',
  'Italy': 'Italie',
  'Spain': 'Espagne',
  'Netherlands': 'Pays-Bas',
  'Belgium': 'Belgique',
  'Portugal': 'Portugal',
  'Croatia': 'Croatie',
  'Switzerland': 'Suisse',
  'Denmark': 'Danemark',
  'Sweden': 'Suède',
  'Norway': 'Norvège',
  'Poland': 'Pologne',
  'Ukraine': 'Ukraine',
  'Austria': 'Autriche',
  'Turkey': 'Turquie',
  'Türkiye': 'Turquie',
  'Scotland': 'Écosse',
  'Wales': 'Pays de Galles',
  'Ireland': 'Irlande',
  'Northern Ireland': 'Irlande du Nord',
  'Greece': 'Grèce',
  'Czech Republic': 'République Tchèque',
  'Czechia': 'République Tchèque',
  'Slovakia': 'Slovaquie',
  'Slovenia': 'Slovénie',
  'Hungary': 'Hongrie',
  'Romania': 'Roumanie',
  'Bulgaria': 'Bulgarie',
  'Finland': 'Finlande',
  'Iceland': 'Islande',
  'Albania': 'Albanie',
  'Georgia': 'Géorgie',
  'Serbia': 'Serbie',
  'Montenegro': 'Monténégro',
  'North Macedonia': 'Macédoine du Nord',
  'Bosnia & Herzegovina': 'Bosnie-Herzégovine',
  'Bosnia and Herzegovina': 'Bosnie-Herzégovine',
  'Cyprus': 'Chypre',
  'Luxembourg': 'Luxembourg',
  'Malta': 'Malte',
  'Andorra': 'Andorre',
  'San Marino': 'Saint-Marin',
  'Liechtenstein': 'Liechtenstein',
  'Gibraltar': 'Gibraltar',
  'Faroe Islands': 'Îles Féroé',
  'Kosovo': 'Kosovo',

  // South America
  'Brazil': 'Brésil',
  'Argentina': 'Argentine',
  'Uruguay': 'Uruguay',
  'Colombia': 'Colombie',
  'Chile': 'Chili',
  'Peru': 'Pérou',
  'Ecuador': 'Équateur',
  'Paraguay': 'Paraguay',
  'Venezuela': 'Venezuela',
  'Bolivia': 'Bolivie',

  // North/Central America
  'USA': 'États-Unis',
  'United States': 'États-Unis',
  'Mexico': 'Mexique',
  'Canada': 'Canada',
  'Costa Rica': 'Costa Rica',
  'Jamaica': 'Jamaïque',
  'Panama': 'Panama',
  'Honduras': 'Honduras',
  'El Salvador': 'El Salvador',
  'Haiti': 'Haïti',
  'Curaçao': 'Curaçao',
  'Trinidad and Tobago': 'Trinité-et-Tobago',
  'Trinidad & Tobago': 'Trinité-et-Tobago',

  // Africa
  'Ivory Coast': "Côte d'Ivoire",
  'Senegal': 'Sénégal',
  'Morocco': 'Maroc',
  'Algeria': 'Algérie',
  'Tunisia': 'Tunisie',
  'Egypt': 'Égypte',
  'Nigeria': 'Nigéria',
  'Cameroon': 'Cameroun',
  'Ghana': 'Ghana',
  'Mali': 'Mali',
  'Burkina Faso': 'Burkina Faso',
  'Congo DR': 'RDC',
  'DR Congo': 'RDC',
  'Congo': 'Congo',
  'South Africa': 'Afrique du Sud',
  'Guinea': 'Guinée',
  'Cape Verde': 'Cap-Vert',
  'Angola': 'Angola',
  'Gabon': 'Gabon',
  'Togo': 'Togo',
  'Benin': 'Bénin',
  'Madagascar': 'Madagascar',

  // Asia / Oceania
  'Japan': 'Japon',
  'South Korea': 'Corée du Sud',
  'Australia': 'Australie',
  'Iran': 'Iran',
  'Saudi Arabia': 'Arabie Saoudite',
  'Qatar': 'Qatar',
  'China': 'Chine',
  'Iraq': 'Irak',
  'Syria': 'Syrie',
  'Uzbekistan': 'Ouzbékistan',
  'United Arab Emirates': 'Émirats Arabes Unis',
  'UAE': 'Émirats Arabes Unis',
  'New Zealand': 'Nouvelle-Zélande',
};

function translateTeam(name) {
  if (!name) return name;
  return TEAM_TRANSLATIONS[name] || name;
}

function translateFixture(fixture) {
  if (!fixture || !fixture.teams) return fixture;
  if (fixture.teams.home && fixture.teams.home.name) {
    fixture.teams.home.name = translateTeam(fixture.teams.home.name);
  }
  if (fixture.teams.away && fixture.teams.away.name) {
    fixture.teams.away.name = translateTeam(fixture.teams.away.name);
  }
  return fixture;
}

function translateStandingsResponse(data) {
  if (!data || !data.response) return data;
  data.response.forEach(item => {
    if (item.league && item.league.standings) {
      item.league.standings.forEach(standingGroup => {
        if (Array.isArray(standingGroup)) {
          standingGroup.forEach(row => {
            if (row.team && row.team.name) {
              row.team.name = translateTeam(row.team.name);
            }
          });
        }
      });
    }
  });
  return data;
}

// Football API proxy route
app.get('/api/football/matches', async (req, res) => {
  try {
    const { date } = req.query; // Expecting YYYY-MM-DD
    
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required (YYYY-MM-DD)' });
    }

    const now = Date.now();
    if (matchesCache[date] && (now - matchesCache[date].timestamp < MATCHES_CACHE_DURATION)) {
      console.log(`Serving matches from server cache for date: ${date}`);
      return res.json(matchesCache[date].data);
    }

    console.log(`Fetching matches from API-Sports for date: ${date}`);
    
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      params: { date },
      headers: {
        'x-apisports-key': '9a068a21856b2e7f20dedff6b4322352'
      }
    });
    
    console.log(`API-Football response status: ${response.status}`);
    console.log(`API-Football response data count: ${response.data.response?.length || 0}`);
    
    if (response.data && response.data.response) {
      response.data.response.forEach(translateFixture);
    }

    // Store in cache
    matchesCache[date] = {
      data: response.data,
      timestamp: now
    };

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
    
    if (response.data && response.data.response) {
      response.data.response.forEach(translateFixture);
    }

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
    
    translateStandingsResponse(response.data);

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
    
    if (response.data && response.data.response) {
      response.data.response.forEach(translateFixture);
    }

    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching fixtures for ${req.params.league}:`, error.message);
    res.status(500).json({ message: 'Error fetching league fixtures' });
  }
});

// --- Enhanced Football News RSS System ---
const FOOTBALL_RSS_SOURCES = [
  { url: 'https://www.sports.fr/football/feed/', name: 'Sports.fr', sourceUrl: 'https://www.sports.fr' },
  { url: 'https://www.sports.fr/transferts/feed/', name: 'Sports.fr', sourceUrl: 'https://www.sports.fr' },
  { url: 'https://www.foot01.com/feed', name: 'Foot01', sourceUrl: 'https://www.foot01.com' },
  { url: 'https://www.footmercato.net/feed', name: 'Footmercato', sourceUrl: 'https://www.footmercato.net' },
];

const newsCache = { data: null, timestamp: 0 };
const NEWS_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

function generateArticleHash(str) {
  return crypto.createHash('md5').update(str).digest('hex').substring(0, 12);
}

function stripHtmlTags(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractArticleImage(item) {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item['media:content']?.$?.url) return item['media:content'].$.url;
  const content = item.content || item['content:encoded'] || '';
  const imgMatch = /<img[^>]+src=["']([^"'>]+)["']/i.exec(content);
  if (imgMatch) return imgMatch[1];
  return null;
}

async function fetchAllFootballNews() {
  if (newsCache.data && (Date.now() - newsCache.timestamp) < NEWS_CACHE_DURATION) {
    return newsCache.data;
  }

  const newsParser = new Parser({
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    customFields: { item: ['media:content', 'media:thumbnail'] }
  });

  const feedPromises = FOOTBALL_RSS_SOURCES.map(source =>
    newsParser.parseURL(source.url)
      .then(feed => feed.items.map(item => ({
        id: generateArticleHash((item.title || '') + (item.link || '')),
        title: item.title || '',
        description: stripHtmlTags(item.contentSnippet || item.content || '').substring(0, 300),
        link: item.link || '',
        image: extractArticleImage(item),
        source: source.name,
        sourceUrl: source.sourceUrl,
        pubDate: item.pubDate || '',
        timestamp: new Date(item.pubDate || Date.now()).getTime()
      })))
      .catch(err => {
        console.warn(`RSS fetch failed for ${source.name}: ${err.message}`);
        return [];
      })
  );

  const results = await Promise.allSettled(feedPromises);
  const articles = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(a => a.title && a.link)
    .sort((a, b) => b.timestamp - a.timestamp);

  // Deduplicate by title similarity
  const seen = new Set();
  const uniqueArticles = articles.filter(article => {
    const key = article.title.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  newsCache.data = uniqueArticles;
  newsCache.timestamp = Date.now();
  return uniqueArticles.slice(0, 10);
}

// Legacy /api/news endpoint (for NewsSidebar backward compat)
app.get('/api/news', async (req, res) => {
  try {
    const articles = await fetchAllFootballNews();
    res.json(articles.slice(0, 10));
  } catch (error) {
    console.error('Error fetching RSS feeds:', error.message);
    res.status(500).json({ message: 'Error fetching news' });
  }
});

// Comprehensive actualites endpoint
app.get('/api/actualites', async (req, res) => {
  try {
    const articles = await fetchAllFootballNews();
    res.json(articles);
  } catch (error) {
    console.error('Error fetching actualites:', error.message);
    res.status(500).json({ message: 'Error fetching news' });
  }
});

// GET /api/admin/stats - Calculate actual statistics from MongoDB
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 1. Users Stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBanned: false });
    const proUsers = await User.countDocuments({ isPro: true });
    const newToday = await User.countDocuments({ createdAt: { $gte: startOfDay } });

    // 2. Channels Stats
    const totalChannels = await Channel.countDocuments();
    const premiumChannels = await Channel.countDocuments({ premium: true });
    const freeChannels = await Channel.countDocuments({ premium: false });

    // 3. Revenue Stats (from completed transactions)
    const completedTransactions = await Transaction.find({ status: 'completed' });
    const totalRevenue = completedTransactions.reduce((acc, t) => {
      if (t.type === 'recharge' || t.type === 'pro' || t.type === 'subscription') {
        return acc + t.amount;
      }
      return acc;
    }, 0);

    const thisMonthTransactions = completedTransactions.filter(t => t.createdAt >= startOfMonth);
    const thisMonthRevenue = thisMonthTransactions.reduce((acc, t) => {
      if (t.type === 'recharge' || t.type === 'pro' || t.type === 'subscription') {
        return acc + t.amount;
      }
      return acc;
    }, 0);

    const subscriptionRevenue = completedTransactions
      .filter(t => t.type === 'subscription')
      .reduce((acc, t) => acc + t.amount, 0);
    const proRevenue = completedTransactions
      .filter(t => t.type === 'pro')
      .reduce((acc, t) => acc + t.amount, 0);

    // 4. Content (Pronos) Stats
    const totalPronos = await Prono.countDocuments();
    const publishedToday = await Prono.countDocuments({ createdAt: { $gte: startOfDay } });
    const pendingReview = await Prono.countDocuments({ status: 'pending' });

    // Success Rate: based on general status 'won' or 'lost'
    const totalEvaluated = await Prono.countDocuments({ status: { $in: ['won', 'lost'] } });
    const wonPronos = await Prono.countDocuments({ status: 'won' });
    const successRate = totalEvaluated > 0 ? Math.round((wonPronos / totalEvaluated) * 100) : 0;

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        premium: proUsers,
        newToday: newToday
      },
      channels: {
        total: totalChannels,
        premium: premiumChannels,
        free: freeChannels,
        mostActive: totalChannels > 0 ? 'Canaux Communautaires' : 'Aucun'
      },
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        subscriptions: subscriptionRevenue,
        channelFees: proRevenue
      },
      content: {
        totalPronos: totalPronos,
        publishedToday: publishedToday,
        successRate: successRate,
        pendingReview: pendingReview
      }
    });
  } catch (error) {
    console.error('Error calculating admin stats:', error);
    res.status(500).json({ message: 'Error calculating admin stats' });
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

// Fast, non-admin API for uploading files (images, audio) via multipart/form-data
app.post('/api/upload-media', authenticateToken, upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni.' });
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ message: 'Erreur lors du téléversement du média.' });
  }
});

// ----------------------------------------------------------------------
// Pronos API
// ----------------------------------------------------------------------

let cachedPronosList = [
  {
    _id: "ch_msg_caracas_santa_fe",
    matchId: 1001,
    homeTeamName: "Caracas FC",
    awayTeamName: "Santa Fe",
    league: "Canal DOOOBI 🤑",
    matchDate: new Date("2026-07-31T12:45:00.000Z"),
    freeExpectedResult: "Oui (Les 2 marquent)",
    freeConfidence: 80,
    freeObservation: "ON est prêt",
    premiumExpectedResult: "",
    premiumOdds: 0,
    premiumConfidence: 0,
    premiumObservation: "",
    status: "pending",
    freeStatus: "pending",
    premiumStatus: "pending",
    createdAt: new Date("2026-07-31T12:45:00.000Z")
  },
  {
    _id: "ch_msg_forward_chattanooga",
    matchId: 1002,
    homeTeamName: "Forward Madison",
    awayTeamName: "Chattanooga Red Wolves",
    league: "Canal Talakaka Pro",
    matchDate: new Date("2026-07-30T12:45:00.000Z"),
    freeExpectedResult: "Plus de 1.5 buts",
    freeConfidence: 80,
    freeObservation: "À revoir",
    premiumExpectedResult: "",
    premiumOdds: 0,
    premiumConfidence: 0,
    premiumObservation: "",
    status: "pending",
    freeStatus: "pending",
    premiumStatus: "pending",
    createdAt: new Date("2026-07-30T12:45:00.000Z")
  }
];

app.get('/api/pronos', async (req, res) => {
  try {
    let dbPronos = [];
    try {
      dbPronos = await Prono.find().sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.warn('Could not query Prono collection:', e);
    }

    const cleanStr = (s) => String(s || '').replace(/[⚽🎯🏆💡]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim();

    // Deduplicate dbPronos itself (eliminate any legacy records with hash/invalid IDs if a real one exists)
    const uniqueDbPronos = [];
    const seenDbMatchups = new Map();

    for (const p of dbPronos) {
      const matchIdNum = Number(p.matchId);
      const hasValidMatchId = matchIdNum && !isNaN(matchIdNum) && matchIdNum < 100000000;
      const teamKey = (p.homeTeamName && p.awayTeamName) 
        ? `${cleanStr(p.homeTeamName)}_vs_${cleanStr(p.awayTeamName)}`
        : `id_${p._id}`;

      if (!seenDbMatchups.has(teamKey)) {
        seenDbMatchups.set(teamKey, p);
        uniqueDbPronos.push(p);
      } else {
        const existing = seenDbMatchups.get(teamKey);
        const existingHasValidId = existing.matchId && !isNaN(Number(existing.matchId)) && Number(existing.matchId) < 100000000;
        
        // If current item has a valid numeric API ID or is verified, replace the legacy broken one
        if ((hasValidMatchId && !existingHasValidId) || (p.status !== 'pending' && existing.status === 'pending')) {
          const idx = uniqueDbPronos.indexOf(existing);
          if (idx !== -1) uniqueDbPronos[idx] = p;
          seenDbMatchups.set(teamKey, p);
        }
      }
    }
    dbPronos = uniqueDbPronos;
    
    // Retroactively synchronize all verified pronostics into channels
    try {
      const verifiedDbPronos = dbPronos.filter(p => p.status === 'won' || p.status === 'lost');
      for (const vp of verifiedDbPronos) {
        await syncPronoStatusToChannels(vp.matchId, vp.status, vp.actualResult, vp.homeTeamName, vp.awayTeamName);
      }
    } catch (syncErr) {
      // Non-blocking
    }

    // Build set of match identifiers from dbPronos to avoid duplicates
    const dbMatchKeys = new Set();
    dbPronos.forEach(p => {
      if (p.matchId && !isNaN(Number(p.matchId))) {
        dbMatchKeys.add(String(p.matchId));
      }
      if (p.homeTeamName && p.awayTeamName) {
        const key = `${cleanStr(p.homeTeamName)}_vs_${cleanStr(p.awayTeamName)}`;
        dbMatchKeys.add(key);
      }
      if (p.messageId) {
        dbMatchKeys.add(String(p.messageId));
      }
    });

    const channelPronos = [];
    try {
      const channels = await Channel.find({}).lean();
      channels.forEach(ch => {
        (ch.messages || []).forEach(msg => {
          const text = String(msg.text || '');
          if (text.includes(' vs ') && (text.includes('-') || text.includes('—') || text.includes('Analyse:'))) {
            let mainLine = text;
            let analysisText = '';

            const analyseIdx = text.indexOf('Analyse:');
            if (analyseIdx !== -1) {
              mainLine = text.substring(0, analyseIdx).trim();
              mainLine = mainLine.replace(/💡\s*$/, '').trim();
              analysisText = text.substring(analyseIdx + 8).trim();
            }

            let parts = mainLine.split(' — ');
            if (parts.length < 2) {
              parts = mainLine.split(' - ');
            }

            const matchPart = parts[0] ? parts[0].trim() : '';
            const teams = matchPart.split(' vs ');
            const homeTeamName = teams[0] ? teams[0].replace(/[⚽🎯🏆💡]/g, '').trim() : 'Équipe 1';
            const awayTeamName = teams[1] ? teams[1].replace(/[⚽🎯🏆💡]/g, '').trim() : 'Équipe 2';
            const teamKey = `${cleanStr(homeTeamName)}_vs_${cleanStr(awayTeamName)}`;
            const msgMatchId = String(msg.pronoMatchId || msg._id || '');

            // Skip if this match is already present in dbPronos or earlier in channelPronos
            if (dbMatchKeys.has(msgMatchId) || dbMatchKeys.has(teamKey) || (msg._id && dbMatchKeys.has(String(msg._id)))) {
              return;
            }

            // Register key to prevent duplicate channel messages
            if (msgMatchId) dbMatchKeys.add(msgMatchId);
            dbMatchKeys.add(teamKey);
            if (msg._id) dbMatchKeys.add(String(msg._id));

            const isPremium = Boolean(ch.premium);

            let pickPart = String(parts[1] || '')
              .split('(⏳')[0]
              .split('(?')[0]
              .split('(✅')[0]
              .split('(❌')[0]
              .trim();

            const expectedPick = pickPart || mainLine;
            const msgDate = msg.time ? new Date(msg.time) : (msg.createdAt ? new Date(msg.createdAt) : new Date());

            channelPronos.push({
              _id: `ch_msg_${msg._id || msg.id || Date.now()}`,
              matchId: msg.pronoMatchId || msg._id || msg.id || Date.now(),
              homeTeamName,
              awayTeamName,
              league: `Canal ${ch.name}`,
              matchDate: msgDate,
              freeExpectedResult: isPremium ? '' : expectedPick,
              freeConfidence: isPremium ? 0 : 80,
              freeObservation: isPremium ? '' : (analysisText || 'Publication Canal'),
              premiumExpectedResult: isPremium ? expectedPick : '',
              premiumOdds: isPremium ? 1.75 : 0,
              premiumConfidence: isPremium ? 80 : 0,
              premiumObservation: isPremium ? (analysisText || 'Publication Canal') : '',
              status: msg.pronoStatus || 'pending',
              freeStatus: msg.pronoStatus || 'pending',
              premiumStatus: msg.pronoStatus || 'pending',
              actualResult: msg.pronoActualResult || '',
              channelId: ch._id,
              messageId: msg._id,
              createdAt: msgDate
            });
          }
        });
      });
    } catch (e) {
      console.warn('Could not aggregate channel pronos:', e);
    }

    const allPronos = [...channelPronos, ...dbPronos];
    
    // Sort globally by matchDate descending, fallback to createdAt (newest first)
    allPronos.sort((a, b) => {
      const aDate = (a.matchDate || a.createdAt) || 0;
      const bDate = (b.matchDate || b.createdAt) || 0;
      const timeA = new Date(aDate).getTime();
      const timeB = new Date(bDate).getTime();
      return (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA);
    });

    // Final foolproof deduplication pass on all combined pronos
    const finalPronos = [];
    const seenFinalKeys = new Set();
    for (const p of allPronos) {
      const normKey = `${cleanStr(p.homeTeamName)}_vs_${cleanStr(p.awayTeamName)}`;
      if (!seenFinalKeys.has(normKey)) {
        seenFinalKeys.add(normKey);
        finalPronos.push(p);
      } else {
        // If an item already exists, keep the one that has verified status (won/lost) over pending
        const existingIdx = finalPronos.findIndex(item => `${cleanStr(item.homeTeamName)}_vs_${cleanStr(item.awayTeamName)}` === normKey);
        if (existingIdx !== -1 && p.status !== 'pending' && finalPronos[existingIdx].status === 'pending') {
          finalPronos[existingIdx] = p;
        }
      }
    }

    if (finalPronos.length > 0) {
      cachedPronosList = finalPronos;
    }

    res.json(finalPronos.length > 0 ? finalPronos : cachedPronosList);
  } catch (err) {
    console.error('Error fetching pronos stack:', err?.stack || err);
    res.json(cachedPronosList);
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

app.post('/api/pronos', authenticateToken, async (req, res) => {
  try {
    const newProno = new Prono(req.body);
    await newProno.save();
    res.status(201).json(newProno);
  } catch (err) {
    console.error('Error in POST /api/pronos:', err);
    res.status(400).json({ error: 'Failed to create prono', details: err.message });
  }
});

app.put('/api/pronos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const prono = await Prono.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!prono) return res.status(404).json({ error: 'Prono not found' });
    res.json(prono);
  } catch (err) {
    console.error('Error in PUT /api/pronos/:id:', err);
    res.status(400).json({ error: 'Failed to update prono', details: err.message });
  }
});

app.delete('/api/pronos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const prono = await Prono.findByIdAndDelete(req.params.id);
    if (!prono) return res.status(404).json({ error: 'Prono not found' });
    res.json({ message: 'Prono deleted successfully' });
  } catch (err) {
    console.error('Error in DELETE /api/pronos/:id:', err);
    res.status(500).json({ error: 'Failed to delete prono', details: err.message });
  }
});

app.post('/api/pronos/:id/react', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const prono = await Prono.findById(id);
    if (!prono) {
      return res.status(404).json({ error: 'Prono not found' });
    }

    if (!prono.reactions) {
      prono.reactions = [];
    }

    // Find any existing reaction from this user
    let userExistingReactionEmoji = null;
    for (const r of prono.reactions) {
      if (r.users.some(uid => uid.toString() === userId.toString())) {
        userExistingReactionEmoji = r.emoji;
        break;
      }
    }

    if (userExistingReactionEmoji === emoji) {
      // Toggle off: remove user from this emoji's reactions list
      prono.reactions = prono.reactions.map(r => {
        if (r.emoji === emoji) {
          r.users = r.users.filter(uid => uid.toString() !== userId.toString());
        }
        return r;
      }).filter(r => r.users.length > 0);
    } else {
      // If user had a different reaction, remove them from it first
      if (userExistingReactionEmoji) {
        prono.reactions = prono.reactions.map(r => {
          if (r.emoji === userExistingReactionEmoji) {
            r.users = r.users.filter(uid => uid.toString() !== userId.toString());
          }
          return r;
        }).filter(r => r.users.length > 0);
      }

      // Add user to the new reaction
      const targetReaction = prono.reactions.find(r => r.emoji === emoji);
      if (targetReaction) {
        targetReaction.users.push(userId);
      } else {
        prono.reactions.push({ emoji, users: [userId] });
      }
    }

    await prono.save();
    res.json(prono.reactions);
  } catch (err) {
    console.error('Error in POST /api/pronos/:id/react:', err);
    res.status(500).json({ error: 'Failed to react to prono', details: err.message });
  }
});


// --- Pronostic Verification System ---

/**
 * Determines if a prediction was correct based on the actual match result.
 * Handles common French prediction patterns (1X2, double chance, over/under, BTTS, exact score).
 * Returns 'won', 'lost', or null if the pattern can't be determined (needs manual review).
 */
function determinePronoResult(prediction, homeGoals, awayGoals, homeTeam, awayTeam) {
  if (!prediction || homeGoals == null || awayGoals == null) return null;
  const pred = prediction.toLowerCase().trim();
  const homeTeamLower = (homeTeam || '').toLowerCase().trim();
  const awayTeamLower = (awayTeam || '').toLowerCase().trim();

  // --- 1. Standard 6-Option Explicit Pattern Matcher ---
  // Option 1X: Home Win or Draw (HomeGoals >= AwayGoals)
  if (
    pred.startsWith('1x') || pred === '1x' || pred === '1 ou nul' ||
    (pred.includes('1x') && !pred.includes('2x')) ||
    (pred.includes('ou nul') && homeTeamLower && pred.includes(homeTeamLower))
  ) {
    return homeGoals >= awayGoals ? 'won' : 'lost';
  }

  // Option 2X / X2: Away Win or Draw (AwayGoals >= HomeGoals)
  if (
    pred.startsWith('2x') || pred.startsWith('x2') || pred === '2x' || pred === 'x2' || pred === '2 ou nul' ||
    pred.includes('2x') || pred.includes('x2') ||
    (pred.includes('ou nul') && awayTeamLower && pred.includes(awayTeamLower))
  ) {
    return awayGoals >= homeGoals ? 'won' : 'lost';
  }

  // Option 12: Either Team Wins / No Draw (HomeGoals !== AwayGoals)
  if (
    pred.startsWith('12') || pred === '12' || pred === '1 ou 2' || pred.includes('12 -') || pred.includes('pas de nul')
  ) {
    return homeGoals !== awayGoals ? 'won' : 'lost';
  }

  // Option V1: Home Win (HomeGoals > AwayGoals)
  if (
    pred.startsWith('v1') || pred === 'v1' || pred === '1' || pred === 'victoire domicile' ||
    (pred.includes('v1') && !pred.includes('v2')) ||
    (pred.includes('victoire') && homeTeamLower && pred.includes(homeTeamLower) && !pred.includes('nul'))
  ) {
    return homeGoals > awayGoals ? 'won' : 'lost';
  }

  // Option V2: Away Win (AwayGoals > HomeGoals)
  if (
    pred.startsWith('v2') || pred === 'v2' || pred === '2' || pred === 'victoire extérieur' || pred === 'victoire exterieur' ||
    pred.includes('v2') ||
    (pred.includes('victoire') && awayTeamLower && pred.includes(awayTeamLower) && !pred.includes('nul'))
  ) {
    return awayGoals > homeGoals ? 'won' : 'lost';
  }

  // Option X: Draw (HomeGoals === AwayGoals)
  if (
    pred.startsWith('x -') || pred === 'x' || pred === 'nul' || pred.includes('match nul')
  ) {
    return homeGoals === awayGoals ? 'won' : 'lost';
  }

  // --- Fallback Patterns ---
  // Over/Under
  const overMatch = pred.match(/(?:\+|plus de\s*)(\d+[,.]\d*)\s*buts?/i);
  if (overMatch) {
    return (homeGoals + awayGoals) > parseFloat(overMatch[1].replace(',', '.')) ? 'won' : 'lost';
  }
  const underMatch = pred.match(/(?:\-|moins de\s*)(\d+[,.]\d*)\s*buts?/i);
  if (underMatch) {
    return (homeGoals + awayGoals) < parseFloat(underMatch[1].replace(',', '.')) ? 'won' : 'lost';
  }

  // Both Teams To Score (BTTS)
  if (pred.includes('les deux équipes marquent') || pred.includes('les deux equipes marquent') || pred === 'btts') {
    return (homeGoals > 0 && awayGoals > 0) ? 'won' : 'lost';
  }

  // Exact score (e.g. "2-1", "3:0")
  const exactScoreMatch = pred.match(/(\d+)\s*[-–:]\s*(\d+)/);
  if (exactScoreMatch) {
    return (homeGoals === parseInt(exactScoreMatch[1]) && awayGoals === parseInt(exactScoreMatch[2])) ? 'won' : 'lost';
  }

  return null;
}

// Helper to synchronize pronostic status and result into Channel messages
async function syncPronoStatusToChannels(matchId, status, actualResult, homeTeamName, awayTeamName) {
  try {
    if (!status) return;
    
    const statusTextTag = status === 'won' ? '(✅ gagné)' : (status === 'lost' ? '(❌ perdu)' : '(⏳ en attente)');
    const normHome = (homeTeamName || '').toLowerCase().trim();
    const normAway = (awayTeamName || '').toLowerCase().trim();

    const channels = await Channel.find({});
    for (const ch of channels) {
      let modified = false;
      let matchFoundInChannel = false;

      for (const msg of (ch.messages || [])) {
        const msgText = String(msg.text || '');
        const msgMatchId = Number(msg.pronoMatchId || msg._id || 0);
        
        let isMatch = false;
        if (matchId && msgMatchId && Number(matchId) === msgMatchId) {
          isMatch = true;
        } else if (normHome && normAway && msgText.toLowerCase().includes(normHome) && msgText.toLowerCase().includes(normAway)) {
          isMatch = true;
        }

        if (isMatch) {
          matchFoundInChannel = true;
          msg.pronoStatus = status;
          if (actualResult) msg.pronoActualResult = actualResult;
          if (matchId && !msg.pronoMatchId && !isNaN(Number(matchId))) msg.pronoMatchId = Number(matchId);

          // Update text by replacing status tag
          let updatedText = msgText
            .replace(/\(⏳\s*en\s*attente\)/gi, statusTextTag)
            .replace(/\(✅\s*gagné\)/gi, statusTextTag)
            .replace(/\(❌\s*perdu\)/gi, statusTextTag);
          
          if (!updatedText.includes(statusTextTag) && (updatedText.includes(' vs ') || updatedText.includes(' — '))) {
            const lines = updatedText.split('\n');
            lines[0] = `${lines[0]} ${statusTextTag}`;
            updatedText = lines.join('\n');
          }

          msg.text = updatedText;
          modified = true;
        }
      }

      // Also update channel.lastMessage if it references this match
      if (ch.lastMessage && normHome && normAway && ch.lastMessage.toLowerCase().includes(normHome) && ch.lastMessage.toLowerCase().includes(normAway)) {
        let updatedLast = ch.lastMessage
          .replace(/\(⏳\s*en\s*attente\)/gi, statusTextTag)
          .replace(/\(✅\s*gagné\)/gi, statusTextTag)
          .replace(/\(❌\s*perdu\)/gi, statusTextTag);
        ch.lastMessage = updatedLast;
        modified = true;
      }

      // If status is verified (won/lost) and this channel had this pronostic, post an automatic notification message
      if (matchFoundInChannel && (status === 'won' || status === 'lost')) {
        const announcementHeader = `🎯 RÉSULTAT DU PRONOSTIC : ${homeTeamName} vs ${awayTeamName}`;
        const alreadyAnnounced = (ch.messages || []).some(m => String(m.text || '').includes(announcementHeader));
        
        if (!alreadyAnnounced && ch.owner) {
          const outcomeEmoji = status === 'won' ? '✅ GAGNÉ 🎉' : '❌ PERDU';
          const notificationMsg = `${announcementHeader}\n\n⚽ Match : ${homeTeamName} vs ${awayTeamName}\n📊 Score Final : ${actualResult || 'Terminé'}\n🏆 Résultat : ${outcomeEmoji}`;
          
          ch.messages.push({
            user: ch.owner,
            text: notificationMsg,
            time: new Date(),
            isVoiceMessage: false,
            isImage: false,
            likes: 0,
            reactions: []
          });

          ch.lastMessage = `🎯 ${homeTeamName} vs ${awayTeamName} (${status === 'won' ? '✅ Gagné' : '❌ Perdu'})`;
          if (ch.statistics) ch.statistics.messagesSent = (ch.statistics.messagesSent || 0) + 1;
          modified = true;
        }
      }

      if (modified) {
        await ch.save();
        console.log(`[SyncChannels] Synchronized prono status '${status}' to channel: ${ch.name}`);
      }
    }
  } catch (err) {
    console.error('[SyncChannels] Error syncing status to channel messages:', err);
  }
}

async function runBatchVerification() {
  try {
    const bufferTime = new Date();
    bufferTime.setHours(bufferTime.getHours() - 2.5);

    const pendingPronos = await Prono.find({ 
      status: 'pending',
      matchDate: { $lt: bufferTime }
    });

    if (pendingPronos.length === 0) {
      return { message: 'No pending pronostics to verify', results: [] };
    }

    // Deduplicate by matchId so we only fetch each fixture once
    const uniqueMatchIds = [...new Set(pendingPronos.map(p => p.matchId).filter(Boolean))];
    const fixtureCache = {};

    for (const matchId of uniqueMatchIds) {
      try {
        const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
          params: { id: matchId },
          headers: { 'x-apisports-key': '9a068a21856b2e7f20dedff6b4322352' }
        });
        const fixture = response.data?.response?.[0];
        if (fixture) {
          fixtureCache[matchId] = fixture;
        }
      } catch (apiErr) {
        console.error(`API error for matchId ${matchId}:`, apiErr.message);
      }
    }

    const results = [];

    for (const prono of pendingPronos) {
      const fixture = fixtureCache[prono.matchId];
      if (!fixture) {
        results.push({ id: prono._id, match: `${prono.homeTeamName} vs ${prono.awayTeamName}`, status: 'skipped', reason: 'Match introuvable dans l\'API' });
        continue;
      }

      const matchStatus = fixture.fixture?.status?.short;
      const finishedStatuses = ['FT', 'AET', 'PEN'];
      if (!finishedStatuses.includes(matchStatus)) {
        results.push({ id: prono._id, match: `${prono.homeTeamName} vs ${prono.awayTeamName}`, status: 'skipped', reason: `Match pas encore terminé (${fixture.fixture?.status?.long || matchStatus})` });
        continue;
      }

      const homeGoals = fixture.goals?.home ?? null;
      const awayGoals = fixture.goals?.away ?? null;
      const actualResult = `${homeGoals}-${awayGoals}`;

      let freeResult = null;
      if (prono.freeExpectedResult && prono.freeStatus === 'pending') {
        freeResult = determinePronoResult(prono.freeExpectedResult, homeGoals, awayGoals, prono.homeTeamName, prono.awayTeamName);
        if (freeResult) prono.freeStatus = freeResult;
      }
      
      let premiumResult = null;
      if (prono.premiumExpectedResult && prono.premiumStatus === 'pending') {
        premiumResult = determinePronoResult(prono.premiumExpectedResult, homeGoals, awayGoals, prono.homeTeamName, prono.awayTeamName);
        if (premiumResult) prono.premiumStatus = premiumResult;
      }

      // Update global status based on the parsed results
      const freeNeedsReview = (prono.freeExpectedResult && prono.freeStatus === 'pending');
      const premiumNeedsReview = (prono.premiumExpectedResult && prono.premiumStatus === 'pending');
      
      prono.actualResult = actualResult;
      prono.verifiedAt = new Date();

      if (freeNeedsReview || premiumNeedsReview) {
        prono.status = 'pending';
        await prono.save();
        results.push({ id: prono._id, match: `${prono.homeTeamName} vs ${prono.awayTeamName}`, status: 'manual_review', actualResult });
      } else {
        const mainResult = prono.premiumExpectedResult ? prono.premiumStatus : prono.freeStatus;
        prono.status = mainResult || 'won'; // fallback
        await prono.save();

        // Sync to channel messages immediately
        await syncPronoStatusToChannels(prono.matchId, prono.status, actualResult, prono.homeTeamName, prono.awayTeamName);

        results.push({ id: prono._id, match: `${prono.homeTeamName} vs ${prono.awayTeamName}`, status: prono.status, actualResult });
      }
    }

    return { 
      message: `Vérification terminée : ${results.filter(r => r.status === 'won' || r.status === 'lost').length} vérifiés, ${results.filter(r => r.status === 'manual_review').length} à vérifier manuellement`,
      results 
    };
  } catch (err) {
    console.error('Error batch-verifying pronos:', err);
    throw err;
  }
}

// Batch-verify all pending pronostics (grouped by date to minimize API calls)
app.post('/api/pronos/verify-all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await runBatchVerification();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to batch verify' });
  }
});

// Run batch verification automatically every day at 12:00 PM UTC (12:00:00 UTC)
function scheduleDailyVerificationAt12PMUTC() {
  const scheduleNext = () => {
    const now = new Date();
    const next12UTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      12, 0, 0, 0
    ));
    // If 12:00 UTC already passed today, schedule for tomorrow 12:00 UTC
    if (now.getTime() >= next12UTC.getTime()) {
      next12UTC.setUTCDate(next12UTC.getUTCDate() + 1);
    }
    const delay = next12UTC.getTime() - now.getTime();
    console.log(`[Auto-Verify] Next automatic verification scheduled for 12:00 PM UTC in ${(delay / 1000 / 60).toFixed(1)} minutes (${next12UTC.toISOString()})`);
    
    setTimeout(async () => {
      console.log('[Auto-Verify] 12:00 PM UTC reached! Running daily pronostic verification...');
      try {
        const res = await runBatchVerification();
        console.log('[Auto-Verify] Daily verification finished:', res.message);
      } catch (err) {
        console.error('[Auto-Verify] Daily verification error:', err.message);
      }
      scheduleNext();
    }, delay);
  };

  scheduleNext();
}

scheduleDailyVerificationAt12PMUTC();

// One-time fix: find pending pronos with invalid matchIds, look up real fixture IDs by team names, patch & verify
app.post('/api/pronos/fix-match-ids', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pendingPronos = await Prono.find({ status: 'pending' });
    
    // Filter to only those with invalid matchIds
    let brokenPronos = pendingPronos.filter(p => {
      const id = Number(p.matchId);
      return !id || isNaN(id) || id > 100000000;
    });

    // Also look for virtual channel pronos that need fixing/verification
    const channels = await Channel.find({});
    channels.forEach(ch => {
      (ch.messages || []).forEach(msg => {
        const text = String(msg.text || '');
        if (text.includes(' vs ') && (text.includes('-') || text.includes('—') || text.includes('Analyse:'))) {
          // Skip if already verified
          if (msg.pronoStatus === 'won' || msg.pronoStatus === 'lost') return;
          
          let mainLine = text;
          const analyseIdx = text.indexOf('Analyse:');
          if (analyseIdx !== -1) {
            mainLine = text.substring(0, analyseIdx).trim();
            mainLine = mainLine.replace(/💡\s*$/, '').trim();
          }

          let parts = mainLine.split(' — ');
          if (parts.length < 2) parts = mainLine.split(' - ');
          
          const matchPart = parts[0] ? parts[0].trim() : '';
          const teams = matchPart.split(' vs ');
          
          const expectedPick = String(parts[1] || '').split('(⏳')[0].split('(?')[0].split('(✅')[0].split('(❌')[0].trim() || mainLine;
          
          const msgDate = msg.time ? new Date(msg.time) : (msg.createdAt ? new Date(msg.createdAt) : new Date());

          brokenPronos.push({
            isChannelProno: true,
            channelId: ch._id,
            messageId: msg._id,
            _id: msg._id,
            matchId: msg.pronoMatchId || msg._id || Date.now(),
            homeTeamName: teams[0] ? teams[0].trim() : '',
            awayTeamName: teams[1] ? teams[1].trim() : '',
            matchDate: msgDate,
            freeExpectedResult: ch.premium ? '' : expectedPick,
            premiumExpectedResult: ch.premium ? expectedPick : '',
            freeStatus: msg.pronoStatus || 'pending',
            premiumStatus: msg.pronoStatus || 'pending',
            status: msg.pronoStatus || 'pending'
          });
        }
      });
    });

    if (brokenPronos.length === 0) {
      return res.json({ message: 'No pronostics with broken match IDs found', fixed: 0, results: [] });
    }

    const results = [];

    for (const prono of brokenPronos) {
      const homeTeam = (prono.homeTeamName || '').trim();
      const awayTeam = (prono.awayTeamName || '').trim();
      
      if (!homeTeam || !awayTeam) {
        results.push({ id: prono._id, match: `${homeTeam} vs ${awayTeam}`, status: 'skipped', reason: 'Missing team names' });
        continue;
      }

      try {
        const matchDate = prono.matchDate ? new Date(prono.matchDate).toISOString().split('T')[0] : null;
        let fixture = null;

        // Strategy 1: Search by exact date
        if (matchDate) {
          const dateResponse = await axios.get('https://v3.football.api-sports.io/fixtures', {
            params: { date: matchDate },
            headers: { 'x-apisports-key': '9a068a21856b2e7f20dedff6b4322352' }
          });
          const fixtures = dateResponse.data?.response || [];
          fixture = fixtures.find(f => {
            const apiHome = (f.teams?.home?.name || '').toLowerCase();
            const apiAway = (f.teams?.away?.name || '').toLowerCase();
            const dbHome = homeTeam.toLowerCase();
            const dbAway = awayTeam.toLowerCase();
            return (apiHome.includes(dbHome) || dbHome.includes(apiHome)) &&
                   (apiAway.includes(dbAway) || dbAway.includes(apiAway));
          });
        }

        // Strategy 2: Search ±1 day
        if (!fixture && matchDate) {
          const prevDay = new Date(new Date(matchDate).getTime() - 86400000).toISOString().split('T')[0];
          const nextDay = new Date(new Date(matchDate).getTime() + 86400000).toISOString().split('T')[0];
          const rangeResponse = await axios.get('https://v3.football.api-sports.io/fixtures', {
            params: { from: prevDay, to: nextDay },
            headers: { 'x-apisports-key': '9a068a21856b2e7f20dedff6b4322352' }
          });
          const fixtures = rangeResponse.data?.response || [];
          fixture = fixtures.find(f => {
            const apiHome = (f.teams?.home?.name || '').toLowerCase();
            const apiAway = (f.teams?.away?.name || '').toLowerCase();
            const dbHome = homeTeam.toLowerCase();
            const dbAway = awayTeam.toLowerCase();
            return (apiHome.includes(dbHome) || dbHome.includes(apiHome)) &&
                   (apiAway.includes(dbAway) || dbAway.includes(apiAway));
          });
        }

        if (!fixture) {
          results.push({ id: prono._id, match: `${homeTeam} vs ${awayTeam}`, status: 'not_found', reason: 'Could not find fixture in API' });
          continue;
        }

        // Step 1: Fix the matchId
        const realId = fixture.fixture.id;
        prono.matchId = realId;

        // Step 2: Verify inline if match is finished
        const matchStatus = fixture.fixture?.status?.short;
        const finishedStatuses = ['FT', 'AET', 'PEN'];

        if (!finishedStatuses.includes(matchStatus)) {
          if (prono.isChannelProno) {
            await Channel.updateOne(
              { _id: prono.channelId, "messages._id": prono.messageId },
              { $set: { "messages.$.pronoMatchId": realId } }
            );
          } else {
            await prono.save();
          }
          results.push({ id: prono._id, match: `${homeTeam} vs ${awayTeam}`, status: 'id_fixed', reason: `Match not finished yet (${fixture.fixture?.status?.long || matchStatus})`, newMatchId: realId });
          continue;
        }

        const homeGoals = fixture.goals?.home ?? null;
        const awayGoals = fixture.goals?.away ?? null;
        const actualResult = `${homeGoals}-${awayGoals}`;

        if (prono.freeExpectedResult && prono.freeStatus === 'pending') {
          const freeResult = determinePronoResult(prono.freeExpectedResult, homeGoals, awayGoals, prono.homeTeamName, prono.awayTeamName);
          if (freeResult) prono.freeStatus = freeResult;
        }
        
        if (prono.premiumExpectedResult && prono.premiumStatus === 'pending') {
          const premiumResult = determinePronoResult(prono.premiumExpectedResult, homeGoals, awayGoals, prono.homeTeamName, prono.awayTeamName);
          if (premiumResult) prono.premiumStatus = premiumResult;
        }

        prono.actualResult = actualResult;

        const freeNeedsReview = (prono.freeExpectedResult && prono.freeStatus === 'pending');
        const premiumNeedsReview = (prono.premiumExpectedResult && prono.premiumStatus === 'pending');

        const finalStatus = (freeNeedsReview || premiumNeedsReview) ? 'pending' : (prono.premiumExpectedResult ? prono.premiumStatus : prono.freeStatus) || 'won';

        if (prono.isChannelProno) {
          await Channel.updateOne(
            { _id: prono.channelId, "messages._id": prono.messageId },
            { $set: { 
              "messages.$.pronoMatchId": realId,
              "messages.$.pronoStatus": finalStatus,
              "messages.$.pronoActualResult": actualResult
            }}
          );
        } else {
          prono.status = finalStatus;
          prono.verifiedAt = new Date();
          await prono.save();
        }

        results.push({ 
          id: prono._id, 
          match: `${homeTeam} vs ${awayTeam}`, 
          status: (freeNeedsReview || premiumNeedsReview) ? 'manual_review' : finalStatus, 
          actualResult, 
          newMatchId: realId 
        });
      } catch (apiErr) {
        results.push({ id: prono._id, match: `${homeTeam} vs ${awayTeam}`, status: 'error', reason: apiErr.message });
      }
    }

    const fixedCount = results.filter(r => ['won', 'lost', 'id_fixed'].includes(r.status)).length;
    const verifiedCount = results.filter(r => r.status === 'won' || r.status === 'lost').length;

    res.json({ 
      message: `Réparé ${fixedCount}/${brokenPronos.length} IDs. ${verifiedCount} vérifiés automatiquement.`,
      results
    });
  } catch (err) {
    console.error('Error fixing match IDs:', err);
    res.status(500).json({ error: 'Failed to fix match IDs', details: err.message });
  }
});

// Verify a single pronostic by fetching the match result from API-Sports
app.post('/api/pronos/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const prono = await Prono.findById(req.params.id);
    if (!prono) return res.status(404).json({ error: 'Prono not found' });

    if (prono.status !== 'pending' && prono.freeStatus !== 'pending' && prono.premiumStatus !== 'pending') {
      return res.json({ message: 'Already verified', prono });
    }

    // Fetch match result from API-Sports
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
      params: { id: prono.matchId },
      headers: { 'x-apisports-key': '9a068a21856b2e7f20dedff6b4322352' }
    });

    const fixture = response.data?.response?.[0];
    if (!fixture) {
      return res.status(404).json({ error: 'Match not found in API' });
    }

    const matchStatus = fixture.fixture?.status?.short;
    const finishedStatuses = ['FT', 'AET', 'PEN'];
    if (!finishedStatuses.includes(matchStatus)) {
      return res.status(400).json({ 
        error: 'Match not finished yet', 
        matchStatus: fixture.fixture?.status?.long || matchStatus 
      });
    }

    const homeGoals = fixture.goals?.home ?? null;
    const awayGoals = fixture.goals?.away ?? null;
    const actualResult = `${homeGoals}-${awayGoals}`;

    let freeResult = null;
    if (prono.freeExpectedResult && prono.freeStatus === 'pending') {
      freeResult = determinePronoResult(prono.freeExpectedResult, homeGoals, awayGoals, prono.homeTeamName, prono.awayTeamName);
      if (freeResult) prono.freeStatus = freeResult;
    }
    
    let premiumResult = null;
    if (prono.premiumExpectedResult && prono.premiumStatus === 'pending') {
      premiumResult = determinePronoResult(prono.premiumExpectedResult, homeGoals, awayGoals, prono.homeTeamName, prono.awayTeamName);
      if (premiumResult) prono.premiumStatus = premiumResult;
    }

    const freeNeedsReview = (prono.freeExpectedResult && prono.freeStatus === 'pending');
    const premiumNeedsReview = (prono.premiumExpectedResult && prono.premiumStatus === 'pending');
    
    prono.actualResult = actualResult;
    prono.verifiedAt = new Date();

    if (freeNeedsReview || premiumNeedsReview) {
      prono.status = 'pending';
      await prono.save();
      return res.json({ 
        message: 'Could not auto-determine result. Actual score saved — please set status manually.',
        prono,
        needsManualReview: true
      });
    }

    const mainResult = prono.premiumExpectedResult ? prono.premiumStatus : prono.freeStatus;
    prono.status = mainResult || 'won';
    await prono.save();

    // Sync to channel messages
    await syncPronoStatusToChannels(prono.matchId, prono.status, actualResult, prono.homeTeamName, prono.awayTeamName);

    res.json({ message: `Prono verified: ${prono.status}`, prono });
  } catch (err) {
    console.error('Error verifying prono:', err);
    res.status(500).json({ error: 'Failed to verify prono' });
  }
});

// Manual status override for a pronostic
app.put('/api/pronos/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, freeStatus, premiumStatus, actualResult } = req.body;
    
    const updateData = {};
    if (status) {
      if (!['pending', 'won', 'lost'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
      updateData.status = status;
    }
    if (freeStatus) {
      if (!['pending', 'won', 'lost'].includes(freeStatus)) return res.status(400).json({ error: 'Invalid freeStatus' });
      updateData.freeStatus = freeStatus;
    }
    if (premiumStatus) {
      if (!['pending', 'won', 'lost'].includes(premiumStatus)) return res.status(400).json({ error: 'Invalid premiumStatus' });
      updateData.premiumStatus = premiumStatus;
    }
    
    if (actualResult !== undefined) {
      updateData.actualResult = actualResult;
    }

    // Determine global status dynamically if individual statuses are updated
    const pronoToUpdate = await Prono.findById(req.params.id);
    if (!pronoToUpdate) return res.status(404).json({ error: 'Prono not found' });
    
    if (freeStatus || premiumStatus) {
       const newFree = freeStatus || pronoToUpdate.freeStatus;
       const newPremium = premiumStatus || pronoToUpdate.premiumStatus;
       if ((pronoToUpdate.freeExpectedResult && newFree === 'pending') || 
           (pronoToUpdate.premiumExpectedResult && newPremium === 'pending')) {
         updateData.status = 'pending';
       } else {
         const mainResult = pronoToUpdate.premiumExpectedResult ? newPremium : newFree;
         updateData.status = mainResult || 'won';
       }
    }

    const prono = await Prono.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Sync to channel messages
    await syncPronoStatusToChannels(
      prono.matchId,
      prono.status,
      prono.actualResult,
      prono.homeTeamName,
      prono.awayTeamName
    );

    res.json(prono);
  } catch (err) {
    console.error('Error updating prono status:', err);
    res.status(500).json({ error: 'Failed to update status' });
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

    if (updates.email || updates.username) {
      const query = [];
      if (updates.email) query.push({ email: updates.email });
      if (updates.username) query.push({ username: updates.username });

      const existingUser = await User.findOne({
        _id: { $ne: req.user.id },
        $or: query
      });

      if (existingUser) {
        if (updates.email && existingUser.email === updates.email) {
          return res.status(400).json({ message: 'Cet email est déjà associé à un autre compte.' });
        }
        if (updates.username && existingUser.username === updates.username) {
          return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris.' });
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Un compte avec ces informations existe déjà.' });
    }
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
app.post('/api/channels', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isTipster = user && (user.role === 'admin' || user.isPro || user.accountType === 'tipster');
    const isAdmin = user && user.role === 'admin';

    if (!isTipster) {
      return res.status(403).json({ message: 'La création de canal est réservée aux Tipsters.' });
    }

    const { name, description, premium, allowComments, subscriptionPrice, avatar } = req.body;
    const isPremium = !!premium;

    if (!isAdmin) {
      const ownedChannels = await Channel.find({ owner: req.user.id });
      const freeCount = ownedChannels.filter(c => !c.premium).length;
      const premiumCount = ownedChannels.filter(c => c.premium).length;

      if (isPremium && premiumCount >= 1) {
        return res.status(400).json({ message: 'Vous possédez déjà 1 canal Premium (limite de 1 canal premium par Tipster).' });
      }
      if (!isPremium && freeCount >= 1) {
        return res.status(400).json({ message: 'Vous possédez déjà 1 canal Gratuit (limite de 1 canal gratuit par Tipster).' });
      }
    }

    const channel = new Channel({
      name,
      description,
      premium: isPremium,
      adminOnly: false,
      allowComments: allowComments !== false,
      owner: req.user.id,
      members: [req.user.id],
      subscriptionPrice: isPremium ? (subscriptionPrice || 0) : 0,
      shareLink: `https://pronosbox.com/canal/${Math.floor(Math.random() * 1000) + 100}`,
      ...(avatar ? { avatar } : {})
    });
    await channel.save();
    // Add channel to user's joined channels
    await User.findByIdAndUpdate(req.user.id, {
      $push: { channelsJoined: channel._id }
    });
    const populated = await Channel.findById(channel._id)
      .populate('owner', '_id username avatar')
      .populate('members', '_id username avatar');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/channels', async (req, res) => {
  try {
    const channels = await Channel.find()
      .populate('owner', '_id username avatar')
      .populate('members', '_id username avatar');

    // Auto-sync channel lastMessage with verified pronos
    try {
      const cleanStr = (s) => String(s || '').replace(/[⚽🎯🏆💡]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim();
      const verifiedPronos = await Prono.find({ status: { $in: ['won', 'lost'] } }).lean();

      for (const ch of channels) {
        if (ch.lastMessage && ch.lastMessage.includes(' vs ')) {
          for (const vp of verifiedPronos) {
            const normHome = cleanStr(vp.homeTeamName);
            const normAway = cleanStr(vp.awayTeamName);
            if (normHome && normAway && cleanStr(ch.lastMessage).includes(normHome) && cleanStr(ch.lastMessage).includes(normAway)) {
              const statusTag = vp.status === 'won' ? '(✅ gagné)' : '(❌ perdu)';
              const updated = ch.lastMessage
                .replace(/\(⏳\s*en\s*attente\)/gi, statusTag)
                .replace(/\(✅\s*gagné\)/gi, statusTag)
                .replace(/\(❌\s*perdu\)/gi, statusTag);
              if (updated !== ch.lastMessage) {
                ch.lastMessage = updated;
                await Channel.updateOne({ _id: ch._id }, { $set: { lastMessage: updated } });
              }
            }
          }
        }
      }
    } catch (e) {}

    res.json(channels);
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/channels/:id', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('owner', '_id username avatar')
      .populate('members', '_id username avatar')
      .populate('messages.user', '_id username avatar role');
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Auto-sync pronostic statuses on read
    try {
      const cleanStr = (s) => String(s || '').replace(/[⚽🎯🏆💡]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim();
      const verifiedPronos = await Prono.find({ status: { $in: ['won', 'lost'] } }).lean();
      
      let modified = false;
      for (const msg of (channel.messages || [])) {
        const msgText = String(msg.text || '');
        if (msgText.includes(' vs ')) {
          for (const vp of verifiedPronos) {
            const normHome = cleanStr(vp.homeTeamName);
            const normAway = cleanStr(vp.awayTeamName);
            const isMatch = (vp.matchId && msg.pronoMatchId && Number(vp.matchId) === Number(msg.pronoMatchId)) ||
              (normHome && normAway && cleanStr(msgText).includes(normHome) && cleanStr(msgText).includes(normAway));

            if (isMatch) {
              if (msg.pronoStatus !== vp.status || msg.pronoActualResult !== vp.actualResult) {
                msg.pronoStatus = vp.status;
                msg.pronoActualResult = vp.actualResult;
                const statusTag = vp.status === 'won' ? '(✅ gagné)' : '(❌ perdu)';
                msg.text = msgText
                  .replace(/\(⏳\s*en\s*attente\)/gi, statusTag)
                  .replace(/\(✅\s*gagné\)/gi, statusTag)
                  .replace(/\(❌\s*perdu\)/gi, statusTag);
                modified = true;
              }
            }
          }
        }
      }
      if (modified) {
        await channel.save();
      }
    } catch (e) {
      console.warn('Channel on-read sync warning:', e);
    }

    res.json(channel);
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/channels/:id', authenticateToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    
    if (channel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Seul le propriétaire du canal peut le modifier' });
    }

    const updated = await Channel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/channels/:id', authenticateToken, requireProOrAdmin, async (req, res) => {
  try {
    const channel = await Channel.findByIdAndDelete(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/channels/:id/join', authenticateToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    // Use $addToSet so MongoDB handles the duplicate-check atomically via ObjectId comparison
    await Channel.findByIdAndUpdate(req.params.id, {
      $addToSet: { members: req.user.id }
    });
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { channelsJoined: channel._id }
    });
    res.json({ message: 'Joined channel successfully' });
  } catch (error) {
    console.error('Join channel error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/channels/:id/leave', authenticateToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    // Owners cannot leave their own channel — they must delete it
    if (channel.owner && channel.owner.toString() === req.user.id) {
      return res.status(403).json({ message: 'Le propriétaire ne peut pas quitter son propre canal. Supprimez-le à la place.' });
    }
    await Channel.findByIdAndUpdate(req.params.id, {
      $pull: { members: req.user.id }
    });
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { channelsJoined: channel._id }
    });
    res.json({ message: 'Left channel successfully' });
  } catch (error) {
    console.error('Leave channel error:', error);
    res.status(500).json({ message: error.message });
  }
});


app.post('/api/channels/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { text, imageUrl, audioUrl, isImage, isVoiceMessage, replyTo } = req.body;
    console.log('Received message:', { text, isImage, hasImageUrl: !!imageUrl, imageUrlLength: imageUrl?.length });
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

    if ((isVoiceMessage || audioUrl) && !channel.allowVoiceMessages && !isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Les messages vocaux sont désactivés par l\'administrateur dans ce canal' });
    }
    // Add message
    channel.messages.push({
      user: req.user.id,
      text,
      imageUrl,
      audioUrl,
      isImage,
      isVoiceMessage,
      replyTo,
      likes: 0,
      reactions: []
    });
    // Update statistics
    channel.statistics.messagesSent += 1;
    await channel.save();
    // Get the added message with user details
    const addedMessage = await Channel.findById(req.params.id).
    select('messages').
    populate('messages.user', '_id username avatar role');
    const newMessage = addedMessage.messages[addedMessage.messages.length - 1];
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Debate routes
app.post('/api/debates', authenticateToken, async (req, res) => {
  try {
    const dbUser = await User.findById(req.user.id);
    const isTipster = dbUser && (dbUser.role === 'admin' || dbUser.isPro || dbUser.accountType === 'tipster');
    const isAdmin = dbUser && dbUser.role === 'admin';

    if (!isTipster) {
      return res.status(403).json({ message: 'Seuls les Tipsters et Administrateurs peuvent lancer un débat' });
    }

    if (!isAdmin) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const debatesInLast24h = await Debate.countDocuments({
        author: req.user.id,
        createdAt: { $gte: twentyFourHoursAgo }
      });
      if (debatesInLast24h >= 3) {
        return res.status(403).json({ message: 'Limite atteinte : vous avez déjà lancé 3 débats au cours des dernières 24 heures (limite de 3 débats par jour par Tipster).' });
      }
    }

    const { title, description, images, category, sourceArticle } = req.body;
    
    // Duplicate check for news-sourced debates
    if (sourceArticle?.articleId) {
      const existing = await Debate.findOne({ 'sourceArticle.articleId': sourceArticle.articleId });
      if (existing) {
        return res.status(409).json({ 
          message: 'Un débat existe déjà pour cet article',
          debateId: existing._id 
        });
      }
    }
    
    const debate = new Debate({
      title,
      description,
      images: images || [],
      category: category || 'Général',
      author: req.user.id,
      ...(sourceArticle ? { sourceArticle } : {})
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
    
    const userIndex = debate.likedBy.findIndex(id => id.toString() === req.user.id.toString());
    if (userIndex === -1) {
      debate.likedBy.push(req.user.id);
      debate.likes += 1;
    } else {
      debate.likedBy.splice(userIndex, 1);
      debate.likes -= 1;
    }
    await debate.save();
    const populated = await Debate.findById(debate._id)
      .populate('author', 'username avatar')
      .populate('messages.user', 'username avatar')
      .populate('messages.replies.user', 'username avatar');
    res.json(populated);
  } catch (error) {
    console.error('Like debate error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/debates/:id/messages/:messageId/like', authenticateToken, async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });
    
    const message = debate.messages.id(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const userIndex = message.likedBy.findIndex(id => id.toString() === req.user.id.toString());
    if (userIndex === -1) {
      message.likedBy.push(req.user.id);
      message.likes += 1;
    } else {
      message.likedBy.splice(userIndex, 1);
      message.likes -= 1;
    }
    await debate.save();
    res.json({ likes: message.likes, likedBy: message.likedBy });
  } catch (error) {
    console.error('Like debate message error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/debates/:id/messages/:messageId/replies/:replyId/like', authenticateToken, async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });
    
    const message = debate.messages.id(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const reply = message.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    const userIndex = reply.likedBy.findIndex(id => id.toString() === req.user.id.toString());
    if (userIndex === -1) {
      reply.likedBy.push(req.user.id);
      reply.likes += 1;
    } else {
      reply.likedBy.splice(userIndex, 1);
      reply.likes -= 1;
    }
    await debate.save();
    res.json({ likes: reply.likes, likedBy: reply.likedBy });
  } catch (error) {
    console.error('Like debate reply error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/debates/:id/messages/:messageId/replies', authenticateToken, async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });
    
    const message = debate.messages.id(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    
    const reply = {
      user: req.user.id,
      text: req.body.text,
      likes: 0,
      likedBy: []
    };
    
    message.replies.push(reply);
    
    // Add participant check
    const isParticipant = debate.messages.some(msg => msg.user.toString() === req.user.id || (msg.replies && msg.replies.some(r => r.user.toString() === req.user.id))) || debate.author.toString() === req.user.id;
    if (!isParticipant) {
      debate.participants += 1;
    }
    
    await debate.save();
    
    const updated = await Debate.findById(debate._id)
      .populate('messages.user', 'username avatar')
      .populate('messages.replies.user', 'username avatar')
      .populate('author', 'username avatar');
      
    const updatedMessage = updated.messages.id(req.params.messageId);
    const addedReply = updatedMessage.replies[updatedMessage.replies.length - 1];
    
    res.status(201).json(addedReply);
  } catch (error) {
    console.error('Add reply error:', error);
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

// Delete a debate comment
app.delete('/api/debates/:id/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });

    const messageIndex = debate.messages.findIndex(m => m._id.toString() === req.params.messageId);
    if (messageIndex === -1) return res.status(404).json({ message: 'Message not found' });

    const message = debate.messages[messageIndex];
    const isAdmin = req.user.role === 'admin';
    const isOwner = debate.author.toString() === req.user.id;
    const isAuthor = message.user.toString() === req.user.id;

    if (!isAdmin && !isOwner && !isAuthor) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    debate.messages.splice(messageIndex, 1);
    await debate.save();
    
    const populated = await Debate.findById(debate._id)
      .populate('author', 'username avatar')
      .populate('messages.user', 'username avatar')
      .populate('messages.replies.user', 'username avatar');
    res.json(populated);
  } catch (error) {
    console.error('Error deleting debate message:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a debate reply
app.delete('/api/debates/:id/messages/:messageId/replies/:replyId', authenticateToken, async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });

    const message = debate.messages.id(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const replyIndex = message.replies.findIndex(r => r._id.toString() === req.params.replyId);
    if (replyIndex === -1) return res.status(404).json({ message: 'Reply not found' });

    const reply = message.replies[replyIndex];
    const isAdmin = req.user.role === 'admin';
    const isOwner = debate.author.toString() === req.user.id;
    const isAuthor = reply.user.toString() === req.user.id;

    if (!isAdmin && !isOwner && !isAuthor) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    message.replies.splice(replyIndex, 1);
    await debate.save();
    
    const populated = await Debate.findById(debate._id)
      .populate('author', 'username avatar')
      .populate('messages.user', 'username avatar')
      .populate('messages.replies.user', 'username avatar');
    res.json(populated);
  } catch (error) {
    console.error('Error deleting debate reply:', error);
    res.status(500).json({ message: error.message });
  }
});

// Favorite/unfavorite a debate (prevents auto-deletion)
app.post('/api/debates/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });
    
    const userIndex = debate.favoritedBy.findIndex(id => id.toString() === req.user.id.toString());
    if (userIndex === -1) {
      debate.favoritedBy.push(req.user.id);
    } else {
      debate.favoritedBy.splice(userIndex, 1);
    }
    
    // If at least one user has favorited, make it permanent (null expiresAt = no TTL)
    if (debate.favoritedBy.length > 0) {
      debate.isFavorite = true;
      debate.expiresAt = null;
    } else {
      debate.isFavorite = false;
      debate.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    
    await debate.save();
    const populated = await Debate.findById(debate._id)
      .populate('author', 'username avatar')
      .populate('messages.user', 'username avatar')
      .populate('messages.replies.user', 'username avatar');
    res.json(populated);
  } catch (error) {
    console.error('Favorite debate error:', error);
    res.status(500).json({ message: error.message });
  }
});

// --- Auto-generate top 4 debates from news every 30 minutes ---
const AUTO_DEBATE_INTERVAL = 30 * 60 * 1000;
const MAX_AUTO_DEBATES = 4;

async function autoGenerateDebatesFromNews() {
  try {
    const articles = await fetchAllFootballNews();
    if (!articles || articles.length === 0) {
      console.log('[AutoDebate] No articles available');
      return;
    }

    let botUser = await User.findOne({ username: 'PronosBox', role: 'admin' });
    if (!botUser) botUser = await User.findOne({ role: 'admin' });
    if (!botUser) {
      console.log('[AutoDebate] No admin user found for auto-generation');
      return;
    }

    const existingAutoDebates = await Debate.countDocuments({ isAutoGenerated: true });
    const slotsAvailable = MAX_AUTO_DEBATES - existingAutoDebates;
    
    if (slotsAvailable <= 0) {
      console.log('[AutoDebate] Already have 4 auto-generated debates active');
      return;
    }

    const existingDebates = await Debate.find({ 'sourceArticle.articleId': { $exists: true, $ne: null } })
      .select('sourceArticle.articleId');
    const existingArticleIds = new Set(existingDebates.map(d => d.sourceArticle?.articleId));

    const candidateArticles = articles
      .filter(a => !existingArticleIds.has(a.id) && a.image)
      .slice(0, slotsAvailable);

    for (const article of candidateArticles) {
      const debate = new Debate({
        title: article.title,
        description: article.description + (article.link ? `\n\nSource: ${article.source}` : ''),
        images: article.image ? [article.image] : [],
        category: 'Général',
        author: botUser._id,
        isAutoGenerated: true,
        sourceArticle: {
          articleId: article.id,
          title: article.title,
          link: article.link,
          source: article.source,
          image: article.image
        }
      });
      await debate.save();
      console.log(`[AutoDebate] Created debate: "${article.title.substring(0, 50)}..."`);
    }
    console.log(`[AutoDebate] Created ${candidateArticles.length} new debates`);
  } catch (error) {
    console.error('[AutoDebate] Error:', error.message);
  }
}

// Run auto-generation on startup (after delay) and every 30 minutes
setTimeout(() => {
  autoGenerateDebatesFromNews();
  setInterval(autoGenerateDebatesFromNews, AUTO_DEBATE_INTERVAL);
}, 10000);

// Initialize mock data
const initializeMockData = async () => {
  try {
    // Ensure PronosBox bot user exists
    let botUser = await User.findOne({ username: 'PronosBox' });
    if (!botUser) {
      botUser = new User({
        username: 'PronosBox',
        email: 'bot@pronosbox.com',
        password: 'botpassword123',
        role: 'admin',
        isPro: true,
        avatar: 'https://images.unsplash.com/photo-1531379410502-63bfe8cdaf6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
      });
      await botUser.save();
      console.log('PronosBox bot user created');
    }

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

// Global error handling middleware
import * as Sentry from '@sentry/node';
Sentry.setupExpressErrorHandler(app);

app.use((err, req, res, next) => {
  console.error('Global unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    details: err.stack ? err.stack.split('\n')[0] : ''
  });
});

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