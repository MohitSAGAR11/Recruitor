/**
 * Postgres connection pool (Supabase via Supavisor pooler).
 * Uses the DATABASE_URL connection string; SSL is required by Supabase.
 */
import pg from 'pg';
import { config } from '../config/env.js';

const { Pool } = pg;

export const pool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      ssl: { rejectUnauthorized: false }, // Supabase pooler uses a managed cert
      max: 10,
    })
  : null;

/** Run a query; throws a clear error if the DB isn't configured. */
export async function query(text, params) {
  if (!pool) throw new Error('Database not configured (DATABASE_URL missing).');
  return pool.query(text, params);
}

/** Quick connectivity check used at boot. */
export async function pingDb() {
  if (!pool) return false;
  try {
    await pool.query('select 1');
    return true;
  } catch (err) {
    console.error('[db] ping failed:', err.message);
    return false;
  }
}

export default { pool, query, pingDb };
