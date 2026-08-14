const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
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
app.use('/api/recommend', recommendRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
