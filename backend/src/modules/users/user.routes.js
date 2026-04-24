const express = require('express');
const { body } = require('express-validator');
const auth = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const controller = require('./user.controller');

const router = express.Router();

router.patch('/profile', auth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required')
], controller.updateProfile);

router.use(auth, requireRole('admin'));
router.get('/', controller.listUsers);
router.patch('/:id/role', [body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member')], controller.updateRole);

module.exports = router;
