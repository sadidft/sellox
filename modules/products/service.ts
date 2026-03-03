import { eq, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '../../core/db.js'
import { products } from './schema.js'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function listProducts(activeOnly = false) {
  const db = getDb()
  let query = db.select().from(products).orderBy(products.sortOrder, desc(products.createdAt))
  if (activeOnly) {
    return db.select().from(products).where(eq(products.isActive, true)).orderBy(products.sortOrder)
  }
  return query
}

export async function getProduct(idOrSlug: string) {
  const db = getDb()
  let rows = await db.select().from(products).where(eq(products.slug, idOrSlug))
  if (rows.length === 0) {
    rows = await db.select().from(products).where(eq(products.id, idOrSlug))
  }
  return rows[0] || null
}

export async function createProduct(data: { title: string; description?: string; price: number; imageUrl?: string }) {
  const db = getDb()
  const id = nanoid()
  const slug = slugify(data.title) + '-' + nanoid(6).toLowerCase()

  await db.insert(products).values({
    id,
    slug,
    title: data.title,
    description: data.description || '',
    price: data.price,
    imageUrl: data.imageUrl || null,
  })

  return id
}

export async function updateProduct(id: string, data: Partial<{
  title: string; description: string; price: number; imageUrl: string; isActive: boolean; sortOrder: number
}>) {
  const db = getDb()
  await db.update(products).set(data).where(eq(products.id, id))
}

export async function deleteProduct(id: string) {
  const db = getDb()
  await db.delete(products).where(eq(products.id, id))
}

export async function countProducts() {
  const db = getDb()
  const rows = await db.select().from(products)
  return rows.length
}
