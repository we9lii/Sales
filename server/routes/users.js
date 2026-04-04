import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db.js';

const router = Router();

// GET /api/users — قائمة المستخدمين (للمشرف)
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, full_name, role, mobile_number, email
       FROM users ORDER BY full_name`
    );
    const users = result.rows.map(u => ({
      id: u.id.toString(),
      username: u.username,
      name: u.full_name,
      role: u.role,
      branch: '',
      mobileNumber: u.mobile_number || '',
      email: u.email || '',
    }));
    res.json(users);
  } catch (err) {
    console.error('Users error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
