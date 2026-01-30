import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ItemService } from '@/services/item.service';
import {
  createItemSchema,
  updateItemSchema,
  itemParamsSchema,
  listItemsQuerySchema,
} from '@/schemas/item';
import type { Env } from '@/types';

const items = new Hono<{ Bindings: Env }>();

/**
 * GET /api/items
 * List all items with pagination
 */
items.get('/', zValidator('query', listItemsQuerySchema), async (c) => {
  const { page, size } = c.req.valid('query');
  const service = new ItemService(c.get('db'));

  const skip = (page - 1) * size;
  const { items: itemsList, total } = await service.getAll(skip, size);

  const pages = Math.ceil(total / size);

  return c.json({
    items: itemsList,
    total,
    page,
    size,
    pages,
  });
});

/**
 * GET /api/items/:id
 * Get single item by ID
 */
items.get('/:id', zValidator('param', itemParamsSchema), async (c) => {
  const { id } = c.req.valid('param');
  const service = new ItemService(c.get('db'));

  const item = await service.getById(id);

  if (!item) {
    return c.json({ error: 'Item not found' }, 404);
  }

  return c.json(item);
});

/**
 * POST /api/items
 * Create new item
 */
items.post('/', zValidator('json', createItemSchema), async (c) => {
  const data = c.req.valid('json');
  const service = new ItemService(c.get('db'));

  const item = await service.create(data);

  return c.json(item, 201);
});

/**
 * PUT /api/items/:id
 * Update item
 */
items.put(
  '/:id',
  zValidator('param', itemParamsSchema),
  zValidator('json', updateItemSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const service = new ItemService(c.get('db'));

    const item = await service.update(id, data);

    if (!item) {
      return c.json({ error: 'Item not found' }, 404);
    }

    return c.json(item);
  }
);

/**
 * DELETE /api/items/:id
 * Delete item
 */
items.delete('/:id', zValidator('param', itemParamsSchema), async (c) => {
  const { id } = c.req.valid('param');
  const service = new ItemService(c.get('db'));

  const deleted = await service.delete(id);

  if (!deleted) {
    return c.json({ error: 'Item not found' }, 404);
  }

  return c.body(null, 204);
});

export default items;
