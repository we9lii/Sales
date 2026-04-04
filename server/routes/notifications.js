import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db.js';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const result = await pool.query(
      `SELECT * FROM sales_notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [parseInt(userId)]
    );
    const notifications = result.rows.map(n => ({
      id: n.id.toString(),
      userId: n.user_id.toString(),
      title: n.title,
      message: n.message || '',
      read: n.is_read,
      createdAt: n.created_at?.toISOString() || new Date().toISOString(),
    }));
    res.json(notifications);
  } catch (err) {
    console.error('GET /notifications error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/notifications — إنشاء إشعار لمستخدم معين
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    await pool.query(
      `INSERT INTO sales_notifications (user_id, title, message, created_at)
       VALUES ($1,$2,$3,NOW())`,
      [parseInt(userId), title, message || '']
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /notifications error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    const { id: userId } = req.user;
    await pool.query(
      `UPDATE sales_notifications SET is_read=TRUE WHERE user_id=$1`,
      [parseInt(userId)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /notifications/read-all error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
