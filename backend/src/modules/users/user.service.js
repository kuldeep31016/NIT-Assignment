const pool = require('../../config/db');

async function listUsers(organizationId) {
  const result = await pool.query(
    `SELECT id, name, email, role, created_at
     FROM users
     WHERE organization_id = $1
     ORDER BY created_at DESC`,
    [organizationId]
  );
  return result.rows;
}

async function updateUserRole({ organizationId, targetUserId, adminUserId, role }) {
  if (targetUserId === adminUserId) {
    const error = new Error('You cannot change your own role');
    error.status = 400;
    throw error;
  }

  const result = await pool.query(
    `UPDATE users
     SET role = $1
     WHERE id = $2 AND organization_id = $3
     RETURNING id, name, email, role, created_at`,
    [role, targetUserId, organizationId]
  );
  const user = result.rows[0];
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
}

async function updateProfile({ userId, organizationId, name, email }) {
  const result = await pool.query(
    `UPDATE users
     SET name = $1, email = $2
     WHERE id = $3 AND organization_id = $4
     RETURNING id, name, email, role, organization_id, provider`,
    [name, email.toLowerCase(), userId, organizationId]
  );
  const user = result.rows[0];
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
}

module.exports = { listUsers, updateUserRole, updateProfile };
