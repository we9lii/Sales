import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db.js';

const router = Router();

const monthNames = {
  '01':'يناير','02':'فبراير','03':'مارس','04':'أبريل',
  '05':'مايو','06':'يونيو','07':'يوليو','08':'أغسطس',
  '09':'سبتمبر','10':'أكتوبر','11':'نوفمبر','12':'ديسمبر',
};

// GET /api/dashboard — إحصائيات اللوحة حسب الدور
router.get('/', authenticate, async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const uid = parseInt(userId);

    // شرط الموظف: تذاكر أنشأها أو محوّلة إليه
    const empWhere = `(
      t.created_by = ${uid}
      OR (SELECT to_employee_id FROM sales_ticket_transfers WHERE ticket_id = t.id ORDER BY created_at DESC LIMIT 1) = ${uid}
    )`;
    const where = role === 'admin' ? 'TRUE' : empWhere;

    const [totalsRes, monthlyRes, tasksRes, alertsRes] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)                                          AS total,
          COUNT(*) FILTER (WHERE status = 'مغلق')          AS closed,
          COUNT(*) FILTER (WHERE status != 'مغلق')         AS open,
          COUNT(*) FILTER (WHERE status = 'جديد')          AS new_count,
          COUNT(*) FILTER (WHERE status = 'جاري المتابعة') AS in_progress
        FROM sales_tickets t WHERE ${where}
      `),
      pool.query(`
        SELECT
          TO_CHAR(t.created_at,'YYYY-MM') AS month,
          COUNT(*)                        AS leads,
          COUNT(*) FILTER (WHERE status = 'مغلق') AS closed
        FROM sales_tickets t WHERE ${where}
        GROUP BY month ORDER BY month DESC LIMIT 12
      `),
      pool.query(`
        SELECT
          COUNT(*)                                              AS total,
          COUNT(*) FILTER (WHERE status = 'pending')           AS pending,
          COUNT(*) FILTER (WHERE status = 'overdue')           AS overdue,
          COUNT(*) FILTER (WHERE status = 'completed')         AS completed
        FROM sales_tasks
        WHERE ${role === 'admin' ? 'TRUE' : `assigned_to_id = ${uid}`}
      `),
      // تنبيهات الملكية: تذاكر لم تُحدَّث منذ 15 يوم
      pool.query(`
        SELECT COUNT(*) AS alerts
        FROM sales_tickets t
        WHERE ${where}
          AND status != 'مغلق'
          AND updated_at < NOW() - INTERVAL '15 days'
      `),
    ]);

    const totals = totalsRes.rows[0];
    const tasks  = tasksRes.rows[0];
    const total  = parseInt(totals.total) || 0;
    const closed = parseInt(totals.closed) || 0;

    const chartData = monthlyRes.rows.reverse().map(r => ({
      name: monthNames[r.month?.split('-')[1]] || r.month,
      closedDeals: parseInt(r.closed) || 0,
      leads: parseInt(r.leads) || 0,
    }));

    res.json({
      total,
      closed,
      open: parseInt(totals.open) || 0,
      newCount: parseInt(totals.new_count) || 0,
      inProgress: parseInt(totals.in_progress) || 0,
      closingRate: total > 0 ? Math.round((closed / total) * 100) : 0,
      ownershipAlerts: parseInt(alertsRes.rows[0]?.alerts) || 0,
      tasks: {
        total: parseInt(tasks.total) || 0,
        pending: parseInt(tasks.pending) || 0,
        overdue: parseInt(tasks.overdue) || 0,
        completed: parseInt(tasks.completed) || 0,
      },
      chartData,
    });
  } catch (err) {
    console.error('GET /dashboard error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
