const { validationResult } = require('express-validator');
const taskService = require('./task.service');

function validate(req, res) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }
  return res.status(400).json({ error: errors.array().map((item) => item.msg) });
}

async function listTasks(req, res, next) {
  try {
    const tasks = await taskService.listTasks(req.user.organizationId, req.query);
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const validationResponse = validate(req, res);
    if (validationResponse) return validationResponse;

    const task = await taskService.createTask({
      organizationId: req.user.organizationId,
      createdBy: req.user.userId,
      ...req.body
    });
    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
}

async function getTask(req, res, next) {
  try {
    const task = await taskService.getTaskById({ id: req.params.id, organizationId: req.user.organizationId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const audit = await taskService.getTaskAudit({ taskId: req.params.id, organizationId: req.user.organizationId });
    return res.json({ ...task, auditLogs: audit });
  } catch (error) {
    return next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const validationResponse = validate(req, res);
    if (validationResponse) return validationResponse;

    const task = await taskService.updateTask({
      id: req.params.id,
      organizationId: req.user.organizationId,
      userId: req.user.userId,
      role: req.user.role,
      payload: req.body
    });
    return res.json(task);
  } catch (error) {
    return next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    await taskService.deleteTask({
      id: req.params.id,
      organizationId: req.user.organizationId,
      userId: req.user.userId,
      role: req.user.role
    });
    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

async function getAudit(req, res, next) {
  try {
    const task = await taskService.getTaskById({ id: req.params.id, organizationId: req.user.organizationId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const logs = await taskService.getTaskAudit({
      taskId: req.params.id,
      organizationId: req.user.organizationId,
      includeActorName: true
    });
    return res.json(logs);
  } catch (error) {
    return next(error);
  }
}

module.exports = { listTasks, createTask, getTask, updateTask, deleteTask, getAudit };
