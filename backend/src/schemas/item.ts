import { z } from 'zod';

/**
 * Item validation schemas
 */

export const createItemSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
});

export const updateItemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
});

export const itemParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

export const listItemsQuerySchema = z.object({
  page: z.string().optional().default('1').transform((val) => parseInt(val, 10)),
  size: z.string().optional().default('10').transform((val) => parseInt(val, 10)),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemParams = z.infer<typeof itemParamsSchema>;
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
