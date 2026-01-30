import type { DB } from '@/db';

/**
 * Cloudflare Worker Environment
 */
export interface Env {
  // D1 Database binding
  DB: D1Database;

  // Environment variables
  ENVIRONMENT?: string;
  CORS_ORIGINS?: string;
}

/**
 * Extended Hono context with DB
 */
declare module 'hono' {
  interface ContextVariableMap {
    db: DB;
  }
}
