import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db.js';

const router = Router();

// GET /api/performance — إحصائيات الأداء
router.get('/', authenticate, async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const isAdmin = role === 'admin';
    const whereClause = isAdmin ? '' : 'WHERE created_by = $1';
    const params = isAdmin ? [] : [parseInt(userId)];

    const [totalsRes, monthlyRes] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'مغلق') AS closed,
          COUNT(*) FILTER (WHERE status != 'مغلق') AS open
        FROM sales_tickets ${whereClause}
      `, params),
      pool.query(`
        SELECT
          TO_CHAR(created_at, 'YYYY-MM') AS month,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'مغلق') AS closed
        FROM sales_tickets ${whereClause}
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `, params),
    ]);

    const totals = totalsRes.rows[0];
    const total = parseInt(totals.total) || 0;
    const closed = parseInt(totals.closed) || 0;
    const achievementPercent = total > 0 ? Math.round((closed / total) * 100) : 0;

    // تحويل البيانات الشهرية للرسم البياني
    const monthNames = {
      '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
      '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
      '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر',
    };
    const chartData = monthlyRes.rows.reverse().map(row => ({
      name: monthNames[row.month.split('-')[1]] || row.month,
      achievement: parseInt(row.total) > 0
        ? Math.round((parseInt(row.closed) / parseInt(row.total)) * 100)
        : 0,
      target: 100,
    }));

    res.json({
      monthlyTarget: 0,
      currentAchievement: closed,
      achievementPercent,
      remaining: Math.max(0, total - closed),
      closedDeals: closed,
      closeRate: achievementPercent,
      monthlyGrowth: 0,
      chartData,
    });
  } catch (err) {
    console.error('GET /performance error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
