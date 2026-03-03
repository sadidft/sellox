import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { Context, Next } from 'hono'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb, admins } from './db.js'
import config from '../sellox.config.js'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: Record<string, any>): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' })
}

export function verifyToken(token: string): any {
  return jwt.verify(token, config.jwtSecret)
}

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, 'sellox_token')
  if (!token) {
    return c.redirect('/admin/login')
  }
  try {
    const decoded = verifyToken(token)
    c.set('admin' as any, decoded)
    await next()
  } catch {
    deleteCookie(c, 'sellox_token')
    return c.redirect('/admin/login')
  }
}

export async function ensureAdminExists() {
  const db = getDb()
  const existing = await db.select().from(admins).limit(1)

  if (existing.length === 0) {
    const hash = await hashPassword(config.adminPassword)
    await db.insert(admins).values({
      id: nanoid(),
      username: config.adminUsername,
      passwordHash: hash,
    })
    console.log(`✅ Admin created: ${config.adminUsername}`)
  }
}

export async function loginAdmin(username: string, password: string) {
  const db = getDb()
  const rows = await db.select().from(admins).where(eq(admins.username, username))
  if (rows.length === 0) return null

  const admin = rows[0]
  const valid = await verifyPassword(password, admin.passwordHash)
  if (!valid) return null

  return signToken({ id: admin.id, username: admin.username })
}
