import { eq } from 'drizzle-orm'
import { getDb, settings } from './db.js'

export class SettingsManager {
  async get(key: string): Promise<string | null> {
    const db = getDb()
    const rows = await db.select().from(settings).where(eq(settings.key, key))
    return rows.length > 0 ? (rows[0].value ?? null) : null
  }

  async set(key: string, value: string): Promise<void> {
    const db = getDb()
    await db.insert(settings)
      .values({ key, value })
      .onDuplicateKeyUpdate({ set: { value } })
  }

  async getMany(keys: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {}
    for (const key of keys) {
      result[key] = (await this.get(key)) || ''
    }
    return result
  }

  async setMany(data: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value)
    }
  }
}
