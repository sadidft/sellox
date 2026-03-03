import type { DB } from './db.js'
import type { EventBus } from './events.js'
import type { SettingsManager } from './settings.js'
import type { SelloxModule, MenuItem } from './types.js'

interface AppContext {
  db: DB
  events: EventBus
  settings: SettingsManager
  modules: SelloxModule[]
  menuItems: MenuItem[]
}

let _ctx: AppContext

export function setAppContext(ctx: AppContext) {
  _ctx = ctx
}

export function getAppContext(): AppContext {
  if (!_ctx) throw new Error('App context not initialized')
  return _ctx
}
