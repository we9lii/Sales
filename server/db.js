import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Get all account IDs in the same linked group
export async function getLinkedIds(userId) {
  const uid = parseInt(userId);
  const res = await pool.query(
    `SELECT id FROM users
     WHERE id = $1
        OR linked_to = $1
        OR linked_to = (SELECT linked_to FROM users WHERE id = $1 AND linked_to IS NOT NULL)
        OR id = (SELECT linked_to FROM users WHERE id = $1)`,
    [uid]
  );
  return res.rows.map(r => r.id);
}

export default pool;
