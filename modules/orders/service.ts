import { eq, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '../../core/db.js'
import { getAppContext } from '../../core/context.js'
import { orders } from './schema.js'

function generatePublicId(): string {
  return 'SLX-' + nanoid(8).toUpperCase()
}

export async function createOrder(data: {
  email: string
  productId: string
  quantity: number
  totalAmount: number
  currency: string
  paymentMethod: string
  ipAddress?: string
}) {
  const db = getDb()
  const id = nanoid()
  const publicId = generatePublicId()

  await db.insert(orders).values({
    id,
    publicId,
    ...data,
    status: 'pending',
  })

  return { id, publicId }
}

export async function getOrder(publicId: string) {
  const db = getDb()
  const rows = await db.select().from(orders).where(eq(orders.publicId, publicId))
  return rows[0] || null
}

export async function getOrderById(id: string) {
  const db = getDb()
  const rows = await db.select().from(orders).where(eq(orders.id, id))
  return rows[0] || null
}

export async function listOrders(limit = 50) {
  const db = getDb()
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit)
}

export async function listPendingOrders(method?: string) {
  const db = getDb()
  let rows = await db.select().from(orders).where(eq(orders.status, 'pending')).orderBy(desc(orders.createdAt))
  if (method) {
    rows = rows.filter(o => o.paymentMethod === method)
  }
  return rows
}

export async function completeOrder(orderId: string) {
  const db = getDb()
  const { events } = getAppContext()

  const order = await getOrderById(orderId)
  if (!order) throw new Error('Order not found')
  if (order.status === 'completed') throw new Error('Order already completed')

  // Allocate stock
  const stockResults = await events.emit('stock:allocate', {
    productId: order.productId,
    quantity: order.quantity,
    orderId: order.id,
  })

  const deliveredContent = stockResults[0]
  if (!deliveredContent || deliveredContent.length === 0) {
    throw new Error('Failed to allocate stock')
  }

  const contentString = Array.isArray(deliveredContent)
    ? deliveredContent.join('\n━━━━━━━━━━━━━━━━━━━━\n')
    : String(deliveredContent)

  // Update order
  await db.update(orders)
    .set({
      status: 'completed',
      deliveredContent: contentString,
      completedAt: new Date(),
    })
    .where(eq(orders.id, orderId))

  // Emit completion event
  await events.emit('order:completed', { ...order, deliveredContent: contentString })

  return contentString
}

export async function countOrders() {
  const db = getDb()
  const rows = await db.select().from(orders)
  return rows.length
}

export async function countPendingOrders() {
  const db = getDb()
  const rows = await db.select().from(orders).where(eq(orders.status, 'pending'))
  return rows.length
}

export async function getTotalRevenue() {
  const db = getDb()
  const rows = await db.select().from(orders).where(eq(orders.status, 'completed'))
  return rows.reduce((sum, o) => sum + o.totalAmount, 0)
}

export async function getOrdersByEmail(email: string) {
  const db = getDb()
  return db.select().from(orders).where(eq(orders.email, email)).orderBy(desc(orders.createdAt))
}
