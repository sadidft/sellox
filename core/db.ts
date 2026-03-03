import { drizzle } from 'drizzle-orm/mysql2'
import { sql } from 'drizzle-orm'
import mysql from 'mysql2/promise'
import { mysqlTable, varchar, text, timestamp } from 'drizzle-orm/mysql-core'

// ── Core Schemas ──
export const settings = mysqlTable('settings', {
  key: varchar('key', { length: 255 }).primaryKey(),
  value: text('value'),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

export const admins = mysqlTable('admins', {
  id: varchar('id', { length: 36 }).primaryKey(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// ── Types ──
export type DB = ReturnType<typeof drizzle>

// ── Singleton ──
let db: DB
let pool: mysql.Pool

export async function initDatabase(url: string) {
  pool = mysql.createPool(url)
  db = drizzle(pool)

  // Create core tables
  await db.execute(sql`\
    CREATE TABLE IF NOT EXISTS settings (
      \`key\` VARCHAR(255) PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await db.execute(sql`\
    CREATE TABLE IF NOT EXISTS admins (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  console.log('✅ Database connected')
  return db
}

export function getDb(): DB {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
  return db
}

export function getPool(): mysql.Pool {
  return pool
}
