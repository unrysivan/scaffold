import { eq, count } from 'drizzle-orm';
import type { DB } from '@/db';
import { items } from '@/db/schema';
import type { CreateItemInput, UpdateItemInput } from '@/schemas/item';

export class ItemService {
  constructor(private db: DB) {}

  /**
   * Get all items with pagination
   */
  async getAll(skip: number = 0, limit: number = 10) {
    const [itemsList, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(items)
        .limit(limit)
        .offset(skip)
        .orderBy(items.id),
      this.db.select({ total: count() }).from(items),
    ]);

    return {
      items: itemsList,
      total: total || 0,
    };
  }

  /**
   * Get item by ID
   */
  async getById(id: number) {
    const [item] = await this.db.select().from(items).where(eq(items.id, id)).limit(1);
    return item || null;
  }

  /**
   * Create new item
   */
  async create(data: CreateItemInput) {
    const [item] = await this.db
      .insert(items)
      .values({
        name: data.name,
        description: data.description,
      })
      .returning();
    return item;
  }

  /**
   * Update item
   */
  async update(id: number, data: UpdateItemInput) {
    const [item] = await this.db
      .update(items)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(items.id, id))
      .returning();
    return item || null;
  }

  /**
   * Delete item
   */
  async delete(id: number) {
    const result = await this.db.delete(items).where(eq(items.id, id)).returning();
    return result.length > 0;
  }
}
