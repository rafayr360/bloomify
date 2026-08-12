const { Pool } = require('pg');
require('dotenv').config();

// Neon requires SSL — this works for both local dev and Render deployment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('Connected to Postgres (Neon)');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
  process.exit(-1);
});

module.exports = pool;
