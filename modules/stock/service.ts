import { eq, and, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '../../core/db.js'
import { stockItems } from './schema.js'

export async function countStock(productId: string): Promise<number> {
  const db = getDb()
  const rows = await db.select()
    .from(stockItems)
    .where(and(eq(stockItems.productId, productId), eq(stockItems.status, 'available')))
  return rows.length
}

export async function addStockItem(productId: string, content: string) {
  const db = getDb()
  await db.insert(stockItems).values({
    id: nanoid(),
    productId,
    content,
    status: 'available',
  })
}

export async function addStockBulk(productId: string, items: string[]) {
  const db = getDb()
  for (const content of items) {
    if (content.trim()) {
      await db.insert(stockItems).values({
        id: nanoid(),
        productId,
        content: content.trim(),
        status: 'available',
      })
    }
  }
  return items.filter(i => i.trim()).length
}

export async function getStockItems(productId: string) {
  const db = getDb()
  return db.select().from(stockItems).where(eq(stockItems.productId, productId))
}

export async function allocateStock(productId: string, quantity: number, orderId: string): Promise<string[]> {
  const db = getDb()

  const available = await db.select()
    .from(stockItems)
    .where(and(eq(stockItems.productId, productId), eq(stockItems.status, 'available')))
    .limit(quantity)

  if (available.length < quantity) {
    throw new Error(`Insufficient stock: need ${quantity}, have ${available.length}`)
  }

  const contents: string[] = []
  for (const item of available) {
    await db.update(stockItems)
      .set({ status: 'sold', orderId, soldAt: new Date() })
      .where(eq(stockItems.id, item.id))
    contents.push(item.content)
  }

  return contents
}

export async function deleteStockItem(id: string) {
  const db = getDb()
  await db.delete(stockItems).where(eq(stockItems.id, id))
}
