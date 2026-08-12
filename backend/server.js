require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Quick DB connectivity check on boot
pool.query('SELECT NOW()')
  .then((result) => {
    console.log('Database time:', result.rows[0].now);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Try: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database on startup:', err.message);
    process.exit(1);
  });
