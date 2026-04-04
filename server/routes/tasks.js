import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db.js';

const router = Router();

function mapTask(t) {
  return {
    id: t.id.toString(),
    title: t.title,
    dueDate: t.due_date?.toISOString() || new Date().toISOString(),
    status: t.status,
    type: t.type,
    assignedToId: t.assigned_to_id?.toString() || '',
    assignedToName: t.assigned_to_name || '',
    createdById: t.created_by_id?.toString() || '',
    createdByName: t.created_by_name || '',
    ticketId: t.ticket_id?.toString() || null,
    clientName: t.client_name || null,
    createdAt: t.created_at?.toISOString() || new Date().toISOString(),
  };
}

// GET /api/tasks
router.get('/', authenticate, async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let result;
    if (role === 'admin') {
      result = await pool.query(
        `SELECT * FROM sales_tasks ORDER BY due_date ASC`
      );
    } else {
      result = await pool.query(
        `SELECT * FROM sales_tasks WHERE assigned_to_id = $1 ORDER BY due_date ASC`,
        [parseInt(userId)]
      );
    }
    res.json(result.rows.map(mapTask));
  } catch (err) {
    console.error('GET /tasks error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/tasks
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, dueDate, type, assignedToId, assignedToName, ticketId, clientName } = req.body;
    const { id: userId, name: userName } = req.user;

    const result = await pool.query(
      `INSERT INTO sales_tasks
         (title, due_date, status, type, assigned_to_id, assigned_to_name,
          created_by_id, created_by_name, ticket_id, client_name, created_at)
       VALUES ($1,$2,
         CASE WHEN $2::timestamp < NOW() THEN 'overdue' ELSE 'pending' END,
         $3,$4,$5,$6,$7,$8,$9,NOW())
       RETURNING *`,
      [title, dueDate, type,
       assignedToId ? parseInt(assignedToId) : parseInt(userId),
       assignedToName || userName,
       parseInt(userId), userName,
       ticketId ? parseInt(ticketId) : null,
       clientName || null]
    );
    res.status(201).json(mapTask(result.rows[0]));
  } catch (err) {
    console.error('POST /tasks error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// PATCH /api/tasks/:id/status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE sales_tasks SET status=$1 WHERE id=$2 RETURNING *`,
      [status, parseInt(req.params.id)]
    );
    res.json(mapTask(result.rows[0]));
  } catch (err) {
    console.error('PATCH /tasks/:id/status error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
