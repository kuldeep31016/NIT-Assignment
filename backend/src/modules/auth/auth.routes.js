const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const controller = require('./auth.controller');

const router = express.Router();

router.post(
  '/register',
  [
    body('orgName').trim().notEmpty().withMessage('Organization name is required'),
    body('orgSlug')
      .trim()
      .matches(/^[a-zA-Z0-9-]+$/)
      .withMessage('Organization slug must be alphanumeric with hyphens only'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  controller.register
);

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  controller.login
);

router.post(
  '/invite',
  authMiddleware,
  requireRole('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member')
  ],
  controller.invite
);

router.post('/google', controller.googleAuth);

router.get('/me', authMiddleware, controller.me);

module.exports = router;
