import { mysqlTable, varchar, text, int, timestamp } from 'drizzle-orm/mysql-core'

export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 36 }).primaryKey(),
  publicId: varchar('public_id', { length: 20 }).unique().notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  productId: varchar('product_id', { length: 36 }).notNull(),
  quantity: int('quantity').default(1).notNull(),
  totalAmount: int('total_amount').notNull(),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentId: varchar('payment_id', { length: 255 }),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  deliveredContent: text('delivered_content'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
})

export const createSQL = `
  CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    public_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    total_amount INT NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    delivered_content TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_public_id (public_id),
    INDEX idx_email (email),
    INDEX idx_status (status)
  )
`
