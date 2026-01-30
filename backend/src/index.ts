import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import type { Env } from '@/types';
import { dbMiddleware } from '@/middleware/db';
import { corsMiddleware } from '@/middleware/cors';
import itemsRoutes from '@/routes/items';

/**
 * Main Hono application
 */
const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', async (c, next) => {
  const corsHandler = corsMiddleware(c.env);
  return corsHandler(c, next);
});
app.use('*', dbMiddleware());

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development',
  });
});

// API routes
const api = new Hono<{ Bindings: Env }>();
api.route('/items', itemsRoutes);

app.route('/api/v1', api);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
});

export default app;
