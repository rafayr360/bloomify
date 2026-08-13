// backend/src/controllers/types.controller.js
const pool = require('../config/db');

exports.getAllTypes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plant_types ORDER BY name;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};