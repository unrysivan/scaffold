import { createMiddleware } from 'hono/factory';
import { getDB } from '@/db';
import type { Env } from '@/types';

/**
 * Database middleware
 * Initializes Drizzle ORM and attaches to context
 */
export const dbMiddleware = () => {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const db = getDB(c.env.DB);
    c.set('db', db);
    await next();
  });
};
