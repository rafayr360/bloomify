const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log("=== FULL NEON DATABASE INSPECTION ===");
    
    // List all public tables
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    
    console.log("Public Tables:", tablesRes.rows.map(t => t.table_name));

    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      const countRes = await pool.query(`SELECT COUNT(*) FROM "${tableName}";`);
      console.log(`\nTable '${tableName}': ${countRes.rows[0].count} rows`);
      
      if (parseInt(countRes.rows[0].count) > 0) {
        const sampleRes = await pool.query(`SELECT * FROM "${tableName}" LIMIT 10;`);
        console.log(`Sample rows from '${tableName}':`);
        console.log(JSON.stringify(sampleRes.rows, null, 2));
      }
    }

  } catch (err) {
    console.error("Error inspecting database:", err);
  } finally {
    await pool.end();
  }
}

main();
