import { readdir, access } from 'fs/promises'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { sql } from 'drizzle-orm'
import type { SelloxModule, MenuItem } from './types.js'
import { getDb } from './db.js'
import { getAppContext } from './context.js'

export async function loadModules(): Promise<SelloxModule[]> {
  const modulesDir = join(process.cwd(), 'modules')
  const folders = await readdir(modulesDir)
  const modules: SelloxModule[] = []

  for (const folder of folders.sort()) {
    const modFile = join(modulesDir, folder, 'mod.ts')

    try {
      await access(modFile)
    } catch {
      continue
    }

    try {
      // Load schema first (create tables)
      const schemaFile = join(modulesDir, folder, 'schema.ts')
      try {
        await access(schemaFile)
        const schema = await import(pathToFileURL(schemaFile).href)
        if (schema.createSQL) {
          const db = getDb()
          const statements = Array.isArray(schema.createSQL) ? schema.createSQL : [schema.createSQL]
          for (const stmt of statements) {
            await db.execute(sql.raw(stmt))
          }
        }
      } catch {}

      // Load module
      const mod: { default: SelloxModule } = await import(pathToFileURL(modFile).href)
      const module = mod.default

      // Register hooks
      if (module.hooks) {
        const ctx = getAppContext()
        for (const [event, handler] of Object.entries(module.hooks)) {
          ctx.events.on(event, handler)
        }
      }

      // Lifecycle
      if (module.onLoad) {
        await module.onLoad()
      }

      modules.push(module)
      console.log(`  ✅ ${module.name} v${module.version}`)
    } catch (e) {
      console.log(`  ❌ ${folder}: ${(e as Error).message}`)
    }
  }

  return modules
}

export function collectMenuItems(modules: SelloxModule[]): MenuItem[] {
  const items: MenuItem[] = []
  for (const mod of modules) {
    if (mod.adminMenu) {
      items.push(...mod.adminMenu())
    }
  }
  return items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
}
