import { cors } from 'hono/cors';
import type { Env } from '@/types';

/**
 * CORS middleware
 * Configures allowed origins from environment
 */
export const corsMiddleware = (env: Env) => {
  const origins = env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || ['*'];

  return cors({
    origin: origins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
};
