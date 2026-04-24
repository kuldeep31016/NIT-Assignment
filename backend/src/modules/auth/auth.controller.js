const { validationResult } = require('express-validator');
const pool = require('../../config/db');
const authService = require('./auth.service');

function collectValidationErrors(req) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }
  return errors.array().map((error) => error.msg);
}

async function register(req, res, next) {
  try {
    const errors = collectValidationErrors(req);
    if (errors) {
      return res.status(400).json({ error: errors });
    }

    const payload = await authService.register(req.body);
    return res.status(201).json(payload);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const errors = collectValidationErrors(req);
    if (errors) {
      return res.status(400).json({ error: errors });
    }

    const payload = await authService.login(req.body);
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
}

async function invite(req, res, next) {
  try {
    const errors = collectValidationErrors(req);
    if (errors) {
      return res.status(400).json({ error: errors });
    }

    const payload = await authService.invite({
      organizationId: req.user.organizationId,
      ...req.body
    });
    return res.status(201).json(payload);
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT u.id, u.name, u.email, u.role, u.organization_id, o.name AS organization_name FROM users u JOIN organizations o ON o.id = u.organization_id WHERE u.id = $1 AND u.organization_id = $2',
      [req.user.userId, req.user.organizationId]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
      organizationName: user.organization_name
    });
  } catch (error) {
    return next(error);
  }
}

async function googleAuth(req, res, next) {
  try {
    const { credential, orgName, orgSlug } = req.body || {};
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential' });
    }
    const payload = await authService.googleAuth({ credential, orgName, orgSlug });
    const status = payload.created ? 201 : 200;
    return res.status(status).json(payload);
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, invite, me, googleAuth };
