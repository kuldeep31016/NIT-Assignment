const express = require('express');
const { body } = require('express-validator');
const auth = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const controller = require('./task.controller');

const router = express.Router();

router.use(auth);

router.get('/', controller.listTasks);
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status')
  ],
  controller.createTask
);
router.get('/:id', controller.getTask);
router.put(
  '/:id',
  [
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status')
  ],
  controller.updateTask
);
router.delete('/:id', controller.deleteTask);
router.get('/:id/audit', requireRole('admin'), controller.getAudit);

module.exports = router;
