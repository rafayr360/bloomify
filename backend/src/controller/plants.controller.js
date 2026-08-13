const pool = require('../config/db');

exports.getAllPlants = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, t.name AS type, ARRAY_AGG(f.name) AS features
      FROM plants p
      LEFT JOIN plant_types t ON p.type_id = t.id
      LEFT JOIN plant_features pf ON pf.plant_id = p.id
      LEFT JOIN features f ON f.id = pf.feature_id
      GROUP BY p.id, t.name
      ORDER BY p.common_name;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlantBySlug = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, t.name AS type, ARRAY_AGG(f.name) AS features
      FROM plants p
      LEFT JOIN plant_types t ON p.type_id = t.id
      LEFT JOIN plant_features pf ON pf.plant_id = p.id
      LEFT JOIN features f ON f.id = pf.feature_id
      WHERE p.slug = $1
      GROUP BY p.id, t.name;
    `, [req.params.slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};