import { Router } from 'express';
import crypto from 'crypto';
import pool from '../db.js';

const router = Router();

const STORE_ACCOUNT_ID = 58;
const STORE_ACCOUNT_NAME = 'المتجر الالكتروني';

// Normalize Salla phone (560000000 + "+966") to 05XXXXXXXX
function normalizeSallaPhone(mobile, mobileCode) {
  let digits = String(mobile || '').replace(/\D/g, '');
  if (!digits) return null;
  // If 9 digits starting with 5 → prepend 0
  if (digits.length === 9 && digits.startsWith('5')) return '0' + digits;
  // If 10 digits starting with 05 → already correct
  if (digits.length === 10 && digits.startsWith('05')) return digits;
  // If starts with 966 → strip and prepend 0
  if (digits.startsWith('966')) return '0' + digits.slice(3);
  return '0' + digits;
}

// Verify Salla webhook signature
function verifySallaSignature(body, signature, secret) {
  if (!secret || !signature) return true; // skip if no secret configured yet
  const computed = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

// Format order items as readable text
function formatOrderItems(items) {
  if (!items || !items.length) return '';
  return items.map((item, i) =>
    `${i + 1}. ${item.name || 'منتج'} — الكمية: ${item.quantity || 1} — السعر: ${item.price?.amount || item.price || '—'} ر.س`
  ).join('\n');
}

// POST /api/webhooks/salla
router.post('/', async (req, res) => {
  try {
    const secret = process.env.SALLA_WEBHOOK_SECRET;
    const signature = req.headers['x-salla-signature'];
    const rawBody = JSON.stringify(req.body);

    if (secret && !verifySallaSignature(rawBody, signature, secret)) {
      console.error('Salla webhook: invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;
    console.log(`Salla webhook received: ${event}`);

    if (event === 'abandoned.cart') {
      await handleAbandonedCart(data);
    } else if (event === 'order.created') {
      await handleOrderCreated(data);
    } else if (event === 'order.status.updated') {
      await handleOrderStatusUpdated(data);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Salla webhook error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// ─── سلة متروكة ─────────────────────────────────────────────
async function handleAbandonedCart(data) {
  const customer = data.customer || {};
  const phone = normalizeSallaPhone(customer.mobile, customer.mobile_code);
  if (!phone) return;

  // Don't create duplicate ticket for same customer's abandoned cart
  const existing = await pool.query(
    "SELECT id FROM sales_tickets WHERE mobile_number = $1 AND salla_event = 'abandoned_cart' AND status != 'مغلق'",
    [phone]
  );
  if (existing.rows.length > 0) return;

  const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'عميل المتجر';
  const cartTotal = data.total?.amount || data.sub_total?.amount || '—';
  const cartUrl = data.checkout_url || '';
  const items = formatOrderItems(data.items);

  const clientNeed = `سلة متروكة — القيمة: ${cartTotal} ر.س${items ? '\n\nالمنتجات:\n' + items : ''}${cartUrl ? '\n\nرابط السلة: ' + cartUrl : ''}`;

  const result = await pool.query(
    `INSERT INTO sales_tickets
       (client_name, mobile_number, location, client_type, client_need, employee_opinion,
        status, created_by, created_by_name, salla_event, created_at, updated_at)
     VALUES ($1,$2,$3,'فرد',$4,$5,'جديد',$6,$7,'abandoned_cart',NOW(),NOW())
     RETURNING id`,
    [name, phone, customer.city || '', clientNeed,
     'تذكرة تلقائية — عميل ترك سلة التسوق بدون إكمال الشراء',
     STORE_ACCOUNT_ID, STORE_ACCOUNT_NAME]
  );

  const ticketId = result.rows[0].id;
  await pool.query(
    `INSERT INTO sales_ticket_activity_log
       (ticket_id, action, action_label, details, performed_by, performed_by_name, created_at)
     VALUES ($1,'CREATE','تذكرة تلقائية من المتجر',$2,$3,$4,NOW())`,
    [ticketId, `سلة متروكة — ${name} — ${phone}`, STORE_ACCOUNT_ID, STORE_ACCOUNT_NAME]
  );
}

// ─── طلب جديد (إتمام شراء) ──────────────────────────────────
async function handleOrderCreated(data) {
  const customer = data.customer || {};
  const phone = normalizeSallaPhone(customer.mobile, customer.mobile_code);
  if (!phone) return;

  const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'عميل المتجر';
  const orderId = data.id || data.reference_id || '';
  const orderTotal = data.amounts?.total?.amount || data.total?.amount || '—';
  const paymentMethod = data.payment_method || '—';
  const items = formatOrderItems(data.items);
  const shippingAddress = data.shipping?.address?.city || customer.city || '';

  const clientNeed = [
    `طلب جديد #${orderId} — القيمة: ${orderTotal} ر.س`,
    `طريقة الدفع: ${paymentMethod}`,
    items ? `\nالمنتجات:\n${items}` : '',
  ].filter(Boolean).join('\n');

  // Close any open abandoned cart ticket for this customer
  await pool.query(
    "UPDATE sales_tickets SET status = 'مغلق', close_reason = 'أكمل العميل الشراء', closed_at = NOW(), updated_at = NOW() WHERE mobile_number = $1 AND salla_event = 'abandoned_cart' AND status != 'مغلق'",
    [phone]
  );

  const result = await pool.query(
    `INSERT INTO sales_tickets
       (client_name, mobile_number, location, client_type, client_need, employee_opinion,
        status, created_by, created_by_name, salla_order_id, salla_event, created_at, updated_at)
     VALUES ($1,$2,$3,'فرد',$4,$5,'جديد',$6,$7,$8,'order',NOW(),NOW())
     RETURNING id`,
    [name, phone, shippingAddress, clientNeed,
     'تذكرة تلقائية — طلب جديد من المتجر الإلكتروني',
     STORE_ACCOUNT_ID, STORE_ACCOUNT_NAME, String(orderId)]
  );

  const ticketId = result.rows[0].id;
  await pool.query(
    `INSERT INTO sales_ticket_activity_log
       (ticket_id, action, action_label, details, performed_by, performed_by_name, created_at)
     VALUES ($1,'CREATE','طلب جديد من المتجر',$2,$3,$4,NOW())`,
    [ticketId, `طلب #${orderId} — ${name} — ${orderTotal} ر.س`, STORE_ACCOUNT_ID, STORE_ACCOUNT_NAME]
  );
}

// ─── تحديث حالة طلب ─────────────────────────────────────────
async function handleOrderStatusUpdated(data) {
  const orderId = String(data.id || data.reference_id || '');
  if (!orderId) return;

  const ticket = await pool.query(
    "SELECT id FROM sales_tickets WHERE salla_order_id = $1",
    [orderId]
  );
  if (!ticket.rows[0]) return;

  const ticketId = ticket.rows[0].id;
  const newStatus = data.status?.name || data.status || '—';

  await pool.query(
    `INSERT INTO sales_ticket_updates (ticket_id, note, updated_by, updated_by_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [ticketId, `تحديث حالة الطلب: ${newStatus}`, STORE_ACCOUNT_ID, STORE_ACCOUNT_NAME]
  );

  await pool.query(
    `INSERT INTO sales_ticket_activity_log
       (ticket_id, action, action_label, details, performed_by, performed_by_name, created_at)
     VALUES ($1,'UPDATE','تحديث من المتجر',$2,$3,$4,NOW())`,
    [ticketId, `حالة الطلب #${orderId}: ${newStatus}`, STORE_ACCOUNT_ID, STORE_ACCOUNT_NAME]
  );

  await pool.query('UPDATE sales_tickets SET updated_at = NOW() WHERE id = $1', [ticketId]);
}

export default router;
