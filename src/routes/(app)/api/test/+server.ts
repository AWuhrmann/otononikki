/// file: src/routes/api/test/+server.ts
import { json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW()');
    return json({ time: result.rows[0].now });
  } catch (e) {
    console.error('Database test failed:', e);
    return json({ error: 'Database connection failed' }, { status: 500 });
  }
}