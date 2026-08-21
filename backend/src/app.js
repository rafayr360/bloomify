const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');


const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://bloomify-e.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// General limiter — applies to everything
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // 100 requests per IP per window
  message: { error: 'Too many requests, please try again later.' },
});
app.use(generalLimiter);

// Stricter limiter — just for the AI recommendation route
const recommendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8, // only 8 AI calls per IP per 15 min
  message: { error: 'Too many recommendation requests, please slow down.' },
});

app.use(express.json());

// Health check — build and test this FIRST before anything else
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Bloomify API is running' });
});

// Mount routes here as you build them, one at a time:
// const authRoutes = require('./routes/auth.routes');
// app.use('/api', authRoutes);

const plantsRoutes = require('./routes/plants.routes');
app.use('/api/plants', plantsRoutes);

const typesRoutes = require('./routes/types.routes');
app.use('/api/types', typesRoutes);

const featuresRoutes = require('./routes/features.routes');
app.use('/api/features', featuresRoutes);

const recommendRoutes = require('./routes/recommend.routes');
app.use('/api/recommend', recommendLimiter, recommendRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
