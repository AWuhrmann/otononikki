import { env } from '$env/dynamic/private';
import pg from 'pg';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'users_db',
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD
});

// Add error listener
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Database connected successfully');
  }
});

export { pool };