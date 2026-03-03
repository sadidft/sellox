import { mysqlTable, varchar, text, timestamp } from 'drizzle-orm/mysql-core'

export const stockItems = mysqlTable('stock_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  productId: varchar('product_id', { length: 36 }).notNull(),
  content: text('content').notNull(),
  status: varchar('status', { length: 20 }).default('available').notNull(),
  orderId: varchar('order_id', { length: 36 }),
  createdAt: timestamp('created_at').defaultNow(),
  soldAt: timestamp('sold_at'),
})

export const createSQL = `
  CREATE TABLE IF NOT EXISTS stock_items (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'available' NOT NULL,
    order_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP NULL,
    INDEX idx_product_status (product_id, status)
  )
`
