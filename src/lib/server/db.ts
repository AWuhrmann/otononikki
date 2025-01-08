import { env } from '$env/dynamic/private';
import pg from 'pg';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'users_db',
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD
});

export async function getUser(username: string) {

  const userResult = await pool.query(
    `SELECT u.*, u.username as username 
  FROM users u WHERE u.username = $1`,
    [username]
  );

  return userResult.rows[0] || null;
}

export async function createUser(data: { username: string }) {

  const userResult = await pool.query(
    `INSERT INTO users (username) VALUES ($1) RETURNING *`,
    [data.username]
  );

  return userResult.rows[0];

}

export { pool };