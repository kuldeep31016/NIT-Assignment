const pool = require('../../config/db');

async function getOrganizationById(id) {
  const result = await pool.query('SELECT id, name, slug, created_at FROM organizations WHERE id = $1', [id]);
  return result.rows[0] || null;
}

module.exports = { getOrganizationById };
