const { validationResult } = require('express-validator');
const userService = require('./user.service');

async function listUsers(req, res, next) {
  try {
    const users = await userService.listUsers(req.user.organizationId);
    return res.json(users);
  } catch (error) {
    return next(error);
  }
}

async function updateRole(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map((item) => item.msg) });
    }

    const user = await userService.updateUserRole({
      organizationId: req.user.organizationId,
      targetUserId: req.params.id,
      adminUserId: req.user.userId,
      role: req.body.role
    });
    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map((item) => item.msg) });
    }

    const user = await userService.updateProfile({
      userId: req.user.userId,
      organizationId: req.user.organizationId,
      name: req.body.name,
      email: req.body.email
    });
    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

module.exports = { listUsers, updateRole, updateProfile };
