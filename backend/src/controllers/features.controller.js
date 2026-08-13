// backend/src/controllers/features.controller.js
const pool = require('../config/db');

exports.getAllFeatures = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM features ORDER BY name;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};