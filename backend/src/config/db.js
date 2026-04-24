const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL || '';
const useSsl = /supabase\.(co|com)/.test(databaseUrl);

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});

module.exports = pool;
