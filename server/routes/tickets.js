import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db.js';

const router = Router();

function mapTicket(t, updates = [], transfers = [], activityLog = []) {
  const lastTransfer = transfers[transfers.length - 1];
  return {
    id: t.id.toString(),
    clientName: t.client_name,
    mobileNumber: t.mobile_number,
    location: t.location || '',
    mapUrl: t.map_url || '',
    clientType: t.client_type || 'فرد',
    clientNeed: t.client_need || '',
    employeeOpinion: t.employee_opinion || '',
    status: t.status,
    closeReason: t.close_reason || '',
    createdBy: t.created_by?.toString() || '',
    createdByName: t.created_by_name || '',
    currentOwnerId: lastTransfer ? lastTransfer.to_employee_id.toString() : t.created_by?.toString() || '',
    currentOwnerName: lastTransfer ? lastTransfer.to_employee_name : t.created_by_name || '',
    createdAt: t.created_at?.toISOString() || new Date().toISOString(),
    updatedAt: t.updated_at?.toISOString() || new Date().toISOString(),
    closedAt: t.closed_at?.toISOString() || null,
    updates: updates.map(u => ({
      id: u.id.toString(),
      note: u.note,
      updatedBy: u.updated_by?.toString() || '',
      updatedByName: u.updated_by_name || '',
      createdAt: u.created_at?.toISOString() || new Date().toISOString(),
    })),
    transfers: transfers.map(tr => ({
      id: tr.id.toString(),
      fromEmployeeId: tr.from_employee_id?.toString() || '',
      fromEmployeeName: tr.from_employee_name || '',
      toEmployeeId: tr.to_employee_id?.toString() || '',
      toEmployeeName: tr.to_employee_name || '',
      createdAt: tr.created_at?.toISOString() || new Date().toISOString(),
    })),
    activityLog: activityLog.map(a => ({
      id: a.id.toString(),
      action: a.action,
      actionLabel: a.action_label || '',
      details: a.details || '',
      performedBy: a.performed_by?.toString() || '',
      performedByName: a.performed_by_name || '',
      createdAt: a.created_at?.toISOString() || new Date().toISOString(),
    })),
  };
}

// GET /api/tickets
router.get('/', authenticate, async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let ticketsResult;
    if (role === 'admin') {
      ticketsResult = await pool.query(
        `SELECT t.*,
           COALESCE(
             (SELECT to_employee_id FROM sales_ticket_transfers WHERE ticket_id = t.id ORDER BY created_at DESC LIMIT 1),
             t.created_by
           ) AS current_owner_id_computed,
           COALESCE(
             (SELECT to_employee_name FROM sales_ticket_transfers WHERE ticket_id = t.id ORDER BY created_at DESC LIMIT 1),
             t.created_by_name
           ) AS current_owner_name_computed
         FROM sales_tickets t
         ORDER BY t.updated_at DESC`
      );
    } else {
      ticketsResult = await pool.query(
        `SELECT t.*,
           COALESCE(
             (SELECT to_employee_id FROM sales_ticket_transfers WHERE ticket_id = t.id ORDER BY created_at DESC LIMIT 1),
             t.created_by
           ) AS current_owner_id_computed,
           COALESCE(
             (SELECT to_employee_name FROM sales_ticket_transfers WHERE ticket_id = t.id ORDER BY created_at DESC LIMIT 1),
             t.created_by_name
           ) AS current_owner_name_computed
         FROM sales_tickets t
         WHERE t.created_by = $1
            OR (SELECT to_employee_id FROM sales_ticket_transfers WHERE ticket_id = t.id ORDER BY created_at DESC LIMIT 1) = $1
         ORDER BY t.updated_at DESC`,
        [parseInt(userId)]
      );
    }

    const tickets = ticketsResult.rows.map(t => {
      const ticket = mapTicket(t);
      ticket.currentOwnerId = t.current_owner_id_computed?.toString() || ticket.currentOwnerId;
      ticket.currentOwnerName = t.current_owner_name_computed || ticket.currentOwnerName;
      return ticket;
    });

    res.json(tickets);
  } catch (err) {
    console.error('GET /tickets error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// GET /api/tickets/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const [ticketRes, updatesRes, transfersRes, logsRes] = await Promise.all([
      pool.query('SELECT * FROM sales_tickets WHERE id = $1', [ticketId]),
      pool.query('SELECT * FROM sales_ticket_updates WHERE ticket_id = $1 ORDER BY created_at', [ticketId]),
      pool.query('SELECT * FROM sales_ticket_transfers WHERE ticket_id = $1 ORDER BY created_at', [ticketId]),
      pool.query('SELECT * FROM sales_ticket_activity_log WHERE ticket_id = $1 ORDER BY created_at', [ticketId]),
    ]);

    if (!ticketRes.rows[0]) return res.status(404).json({ error: 'التذكرة غير موجودة' });

    res.json(mapTicket(ticketRes.rows[0], updatesRes.rows, transfersRes.rows, logsRes.rows));
  } catch (err) {
    console.error('GET /tickets/:id error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/tickets
router.post('/', authenticate, async (req, res) => {
  try {
    const { clientName, mobileNumber, location, mapUrl, clientType, clientNeed, employeeOpinion } = req.body;
    const { id: userId, name: userName } = req.user;

    const result = await pool.query(
      `INSERT INTO sales_tickets
         (client_name, mobile_number, location, map_url, client_type, client_need,
          employee_opinion, status, created_by, created_by_name, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'جديد',$8,$9,NOW(),NOW())
       RETURNING *`,
      [clientName, mobileNumber, location, mapUrl || null, clientType, clientNeed,
       employeeOpinion, parseInt(userId), userName]
    );

    const ticket = result.rows[0];

    await pool.query(
      `INSERT INTO sales_ticket_activity_log
         (ticket_id, action, action_label, details, performed_by, performed_by_name, created_at)
       VALUES ($1,'CREATE','إنشاء تذكرة',$2,$3,$4,NOW())`,
      [ticket.id, `تم فتح تذكرة للعميل: ${clientName} — الجوال: ${mobileNumber}`,
       parseInt(userId), userName]
    );

    res.status(201).json(mapTicket(ticket));
  } catch (err) {
    console.error('POST /tickets error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/tickets/:id/notes
router.post('/:id/notes', authenticate, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { note } = req.body;
    const { id: userId, name: userName } = req.user;

    await pool.query(
      `INSERT INTO sales_ticket_updates (ticket_id, note, updated_by, updated_by_name, created_at)
       VALUES ($1,$2,$3,$4,NOW())`,
      [ticketId, note, parseInt(userId), userName]
    );
    await pool.query(
      `INSERT INTO sales_ticket_activity_log
         (ticket_id, action, action_label, details, performed_by, performed_by_name, created_at)
       VALUES ($1,'UPDATE','إضافة متابعة',$2,$3,$4,NOW())`,
      [ticketId, note, parseInt(userId), userName]
    );
    await pool.query('UPDATE sales_tickets SET updated_at=NOW() WHERE id=$1', [ticketId]);

    res.json({ success: true });
  } catch (err) {
    console.error('POST /tickets/:id/notes error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/tickets/:id/transfer
router.post('/:id/transfer', authenticate, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { toEmployeeId, toEmployeeName } = req.body;
    const { id: userId, name: userName } = req.user;

    await pool.query(
      `INSERT INTO sales_ticket_transfers
         (ticket_id, from_employee_id, from_employee_name, to_employee_id, to_employee_name, created_at)
       VALUES ($1,$2,$3,$4,$5,NOW())`,
      [ticketId, parseInt(userId), userName, parseInt(toEmployeeId), toEmployeeName]
    );
    await pool.query(
      `INSERT INTO sales_ticket_activity_log
         (ticket_id, action, action_label, details, performed_by, performed_by_name, created_at)
       VALUES ($1,'TRANSFER','تحويل التذكرة',$2,$3,$4,NOW())`,
      [ticketId, `تم التحويل من ${userName} إلى ${toEmployeeName}`, parseInt(userId), userName]
    );
    await pool.query(
      `UPDATE sales_tickets SET status='محول', updated_at=NOW() WHERE id=$1`,
      [ticketId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('POST /tickets/:id/transfer error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// PATCH /api/tickets/:id/status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { status, closeReason } = req.body;
    const { id: userId, name: userName } = req.user;

    const closedAt = status === 'مغلق' ? new Date() : null;
    await pool.query(
      `UPDATE sales_tickets
       SET status=$1, close_reason=$2, closed_at=$3, updated_at=NOW()
       WHERE id=$4`,
      [status, closeReason || null, closedAt, ticketId]
    );
    await pool.query(
      `INSERT INTO sales_ticket_activity_log
         (ticket_id, action, action_label, details, performed_by, performed_by_name, created_at)
       VALUES ($1,'CLOSE',$2,$3,$4,$5,NOW())`,
      [ticketId, `تغيير الحالة إلى: ${status}`,
       closeReason ? `السبب: ${closeReason}` : `الحالة الجديدة: ${status}`,
       parseInt(userId), userName]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /tickets/:id/status error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// PATCH /api/tickets/:id/info
router.patch('/:id/info', authenticate, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { clientName, mobileNumber, location, clientType, clientNeed } = req.body;
    const { id: userId, name: userName } = req.user;

    await pool.query(
      `UPDATE sales_tickets
       SET client_name=$1, mobile_number=$2, location=$3, client_type=$4, client_need=$5, updated_at=NOW()
       WHERE id=$6`,
      [clientName, mobileNumber, location, clientType, clientNeed, ticketId]
    );
    await pool.query(
      `INSERT INTO sales_ticket_activity_log
         (ticket_id, action, action_label, details, performed_by, performed_by_name, created_at)
       VALUES ($1,'EDIT','تعديل بيانات العميل','تم تعديل بيانات العميل',$2,$3,NOW())`,
      [ticketId, parseInt(userId), userName]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /tickets/:id/info error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/tickets/:id/evaluate — تقييم وإغلاق التذكرة (للمشرف)
router.post('/:id/evaluate', authenticate, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { closingReport, closeReason } = req.body;
    const { id: userId, name: userName } = req.user;

    await pool.query(
      `UPDATE sales_tickets
       SET status='مغلق', close_reason=$1, closing_report=$2, closed_at=NOW(), updated_at=NOW()
       WHERE id=$3`,
      [closeReason || null, JSON.stringify(closingReport), ticketId]
    );
    await pool.query(
      `INSERT INTO sales_ticket_activity_log
         (ticket_id, action, action_label, details, performed_by, performed_by_name, created_at)
       VALUES ($1,'CLOSE','إغلاق وتقييم التذكرة',$2,$3,$4,NOW())`,
      [ticketId, `نتيجة التقييم: ${closingReport?.result || '—'}`, parseInt(userId), userName]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('POST /tickets/:id/evaluate error:', err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
