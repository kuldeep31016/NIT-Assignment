const pool = require('../../config/db');

function normalizeTask(row) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    createdBy: row.created_by,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignedTo: row.assigned_to,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    creatorName: row.creator_name,
    assigneeName: row.assignee_name
  };
}

async function listTasks(organizationId, filters) {
  const conditions = ['t.organization_id = $1'];
  const values = [organizationId];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`t.status = $${values.length}`);
  }
  if (filters.priority) {
    values.push(filters.priority);
    conditions.push(`t.priority = $${values.length}`);
  }
  if (filters.assigned_to) {
    values.push(filters.assigned_to);
    conditions.push(`t.assigned_to = $${values.length}`);
  }
  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`t.title ILIKE $${values.length}`);
  }

  const query = `
    SELECT
      t.*,
      creator.name AS creator_name,
      assignee.name AS assignee_name
    FROM tasks t
    JOIN users creator ON creator.id = t.created_by
    LEFT JOIN users assignee ON assignee.id = t.assigned_to
    WHERE ${conditions.join(' AND ')}
    ORDER BY t.created_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows.map(normalizeTask);
}

async function createTask({ organizationId, createdBy, title, description, priority, assignedTo, dueDate }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertTaskResult = await client.query(
      `INSERT INTO tasks (organization_id, created_by, title, description, priority, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'medium'), $6, $7)
       RETURNING *`,
      [organizationId, createdBy, title, description || null, priority || 'medium', assignedTo || null, dueDate || null]
    );
    const task = insertTaskResult.rows[0];

    await client.query(
      `INSERT INTO task_audit_logs (task_id, organization_id, performed_by, action, old_values, new_values)
       VALUES ($1, $2, $3, 'CREATED', NULL, $4::jsonb)`,
      [task.id, organizationId, createdBy, JSON.stringify(task)]
    );
    await client.query('COMMIT');
    return normalizeTask(task);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getTaskById({ id, organizationId }) {
  const result = await pool.query(
    `SELECT t.*, creator.name AS creator_name, assignee.name AS assignee_name
     FROM tasks t
     JOIN users creator ON creator.id = t.created_by
     LEFT JOIN users assignee ON assignee.id = t.assigned_to
     WHERE t.id = $1 AND t.organization_id = $2`,
    [id, organizationId]
  );
  return result.rows[0] ? normalizeTask(result.rows[0]) : null;
}

async function getTaskAudit({ taskId, organizationId, includeActorName = false }) {
  if (includeActorName) {
    const result = await pool.query(
      `SELECT l.*, u.name AS performed_by_name
       FROM task_audit_logs l
       JOIN users u ON u.id = l.performed_by
       WHERE l.task_id = $1 AND l.organization_id = $2
       ORDER BY l.created_at DESC`,
      [taskId, organizationId]
    );
    return result.rows;
  }

  const result = await pool.query(
    `SELECT * FROM task_audit_logs
     WHERE task_id = $1 AND organization_id = $2
     ORDER BY created_at DESC`,
    [taskId, organizationId]
  );
  return result.rows;
}

async function updateTask({ id, organizationId, userId, role, payload }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingResult = await client.query(
      'SELECT * FROM tasks WHERE id = $1 AND organization_id = $2 FOR UPDATE',
      [id, organizationId]
    );
    const existingTask = existingResult.rows[0];
    if (!existingTask) {
      const notFound = new Error('Task not found');
      notFound.status = 404;
      throw notFound;
    }

    if (role === 'member' && existingTask.created_by !== userId) {
      const forbidden = new Error('Forbidden');
      forbidden.status = 403;
      throw forbidden;
    }

    const updatedResult = await client.query(
      `UPDATE tasks
       SET
         title = COALESCE($1, title),
         description = $2,
         status = COALESCE($3, status),
         priority = COALESCE($4, priority),
         assigned_to = $5,
         due_date = $6,
         updated_at = NOW()
       WHERE id = $7 AND organization_id = $8
       RETURNING *`,
      [
        payload.title || null,
        payload.description ?? existingTask.description,
        payload.status || null,
        payload.priority || null,
        payload.assignedTo ?? existingTask.assigned_to,
        payload.dueDate ?? existingTask.due_date,
        id,
        organizationId
      ]
    );
    const updatedTask = updatedResult.rows[0];

    const action = existingTask.status !== updatedTask.status ? 'STATUS_CHANGED' : 'UPDATED';
    await client.query(
      `INSERT INTO task_audit_logs (task_id, organization_id, performed_by, action, old_values, new_values)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)`,
      [id, organizationId, userId, action, JSON.stringify(existingTask), JSON.stringify(updatedTask)]
    );

    await client.query('COMMIT');
    return normalizeTask(updatedTask);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function deleteTask({ id, organizationId, userId, role }) {
  if (role !== 'admin') {
    const forbidden = new Error('Forbidden');
    forbidden.status = 403;
    throw forbidden;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const taskResult = await client.query('SELECT * FROM tasks WHERE id = $1 AND organization_id = $2 FOR UPDATE', [id, organizationId]);
    const task = taskResult.rows[0];
    if (!task) {
      const notFound = new Error('Task not found');
      notFound.status = 404;
      throw notFound;
    }

    await client.query(
      `INSERT INTO task_audit_logs (task_id, organization_id, performed_by, action, old_values, new_values)
       VALUES ($1, $2, $3, 'DELETED', $4::jsonb, NULL)`,
      [id, organizationId, userId, JSON.stringify(task)]
    );
    await client.query('DELETE FROM tasks WHERE id = $1 AND organization_id = $2', [id, organizationId]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { listTasks, createTask, getTaskById, getTaskAudit, updateTask, deleteTask };
