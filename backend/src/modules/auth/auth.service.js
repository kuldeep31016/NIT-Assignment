const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../../config/db');

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

function signToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      organizationId: user.organization_id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function mapUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organization_id,
    provider: user.provider
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || `org-${Date.now()}`;
}

async function register({ orgName, orgSlug, name, email, password }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orgResult = await client.query(
      'INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING id, name, slug',
      [orgName, orgSlug]
    );
    const organization = orgResult.rows[0];

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      "INSERT INTO users (organization_id, name, email, password_hash, role, provider) VALUES ($1, $2, $3, $4, $5, 'local') RETURNING id, organization_id, name, email, role, provider",
      [organization.id, name, email.toLowerCase(), passwordHash, 'admin']
    );
    const user = userResult.rows[0];

    await client.query('COMMIT');

    return {
      token: signToken(user),
      user: mapUser(user)
    };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      const conflict = error.detail?.includes('slug') ? 'Organization slug already exists' : 'Email already exists';
      const appError = new Error(conflict);
      appError.status = 400;
      throw appError;
    }
    throw error;
  } finally {
    client.release();
  }
}

async function login({ email, password }) {
  const result = await pool.query(
    'SELECT id, organization_id, name, email, password_hash, role, provider FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  const user = result.rows[0];
  if (!user || !user.password_hash) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  return {
    token: signToken(user),
    user: mapUser(user)
  };
}

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function invite({ organizationId, name, email, role }) {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);
  try {
    const result = await pool.query(
      "INSERT INTO users (organization_id, name, email, password_hash, role, provider) VALUES ($1, $2, $3, $4, $5, 'local') RETURNING id, organization_id, name, email, role, provider, created_at",
      [organizationId, name, email.toLowerCase(), passwordHash, role]
    );
    return { user: mapUser(result.rows[0]), temporaryPassword };
  } catch (error) {
    if (error.code === '23505') {
      const appError = new Error('Email already exists');
      appError.status = 400;
      throw appError;
    }
    throw error;
  }
}

async function verifyGoogleCredential(credential) {
  if (!googleClient) {
    const error = new Error('Google OAuth is not configured on the server');
    error.status = 503;
    throw error;
  }
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (err) {
    const error = new Error('Invalid Google credential');
    error.status = 401;
    throw error;
  }
}

async function googleAuth({ credential, orgName, orgSlug }) {
  const payload = await verifyGoogleCredential(credential);
  const email = (payload.email || '').toLowerCase();
  if (!email || !payload.email_verified) {
    const error = new Error('Google account email is not verified');
    error.status = 401;
    throw error;
  }

  const existing = await pool.query(
    'SELECT id, organization_id, name, email, role, provider, google_id FROM users WHERE email = $1',
    [email]
  );

  if (existing.rows[0]) {
    const user = existing.rows[0];
    if (!user.google_id) {
      await pool.query(
        "UPDATE users SET google_id = $1, provider = 'google', avatar_url = COALESCE(avatar_url, $2) WHERE id = $3",
        [payload.sub, payload.picture || null, user.id]
      );
      user.google_id = payload.sub;
      user.provider = 'google';
    }
    return { token: signToken(user), user: mapUser(user), created: false };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const name = payload.name || email.split('@')[0];
    const desiredOrgName = orgName?.trim() || `${name}'s workspace`;
    const desiredSlugBase = orgSlug?.trim() ? slugify(orgSlug) : slugify(`${name}-${Date.now().toString(36)}`);

    let finalSlug = desiredSlugBase;
    let attempt = 0;
    while (attempt < 5) {
      const slugCheck = await client.query('SELECT 1 FROM organizations WHERE slug = $1', [finalSlug]);
      if (slugCheck.rowCount === 0) break;
      attempt += 1;
      finalSlug = `${desiredSlugBase}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const orgResult = await client.query(
      'INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING id',
      [desiredOrgName, finalSlug]
    );
    const organization = orgResult.rows[0];

    const userResult = await client.query(
      "INSERT INTO users (organization_id, name, email, role, provider, google_id, avatar_url) VALUES ($1, $2, $3, 'admin', 'google', $4, $5) RETURNING id, organization_id, name, email, role, provider",
      [organization.id, name, email, payload.sub, payload.picture || null]
    );
    const user = userResult.rows[0];

    await client.query('COMMIT');
    return { token: signToken(user), user: mapUser(user), created: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { register, login, invite, googleAuth, mapUser };
