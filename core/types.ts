import type { Context, MiddlewareHandler } from 'hono'

export interface SelloxModule {
  name: string
  version: string
  description?: string

  routes?: RouteDef[]
  adminRoutes?: RouteDef[]
  webhookRoutes?: RouteDef[]

  adminMenu?: () => MenuItem[]
  adminSettings?: () => SettingField[]

  hooks?: Record<string, (...args: any[]) => any>

  onLoad?: () => Promise<void> | void
}

export interface RouteDef {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  handler: (c: Context) => any
}

export interface MenuItem {
  label: string
  icon: string
  path: string
  order?: number
  badge?: number | null
}

export interface SettingField {
  key: string
  label: string
  type: 'text' | 'password' | 'number' | 'toggle' | 'select' | 'textarea'
  options?: string[]
  default?: string
  hint?: string
}
