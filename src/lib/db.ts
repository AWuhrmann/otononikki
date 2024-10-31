// src/lib/db.ts
import { Pool } from 'pg';

// Create a new pool instance for connecting to PostgreSQL
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});
