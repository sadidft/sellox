import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { logger } from 'hono/logger'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

import config from '../sellox.config.js'
import { initDatabase } from './db.js'
import { EventBus } from './events.js'
import { SettingsManager } from './settings.js'
import { setAppContext, getAppContext } from './context.js'
import { loadModules, collectMenuItems } from './loader.js'
import { authMiddleware, ensureAdminExists, loginAdmin } from './auth.js'
import { renderStore, renderAdmin, renderModuleView } from './render.js'

const app = new Hono()

// ── Middleware ──
app.use('*', logger())

// ── Static Files ──
app.use('/assets/*', serveStatic({ root: `./themes/${config.theme}/` }))
app.use('/public/*', serveStatic({ root: './' }))

async function bootstrap() {
  console.log('')
  console.log('🧬 Sellox Engine v1.0.0')
  console.log('━━━━━━━━━━━━━━━━━━━━━━')

  // ── Database ──
  if (!config.databaseUrl) {
    console.error('❌ DATABASE_URL is not set!')
    process.exit(1)
  }
  const db = await initDatabase(config.databaseUrl)

  // ── Context ──
  const events = new EventBus()
  const settings = new SettingsManager()
  setAppContext({ db, events, settings, modules: [], menuItems: [] })

  // ── Admin ──
  await ensureAdminExists()

  // ── Modules ──
  console.log('\n📦 Loading modules...')
  const modules = await loadModules()
  const menuItems = collectMenuItems(modules)
  setAppContext({ db, events, settings, modules, menuItems })
  console.log(`�� ${modules.length} modules loaded\n`)

  // ── Register Module Routes ──
  for (const mod of modules) {
    if (mod.routes) {
      for (const r of mod.routes) {
        const method = r.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch'
        app[method](r.path, r.handler)
      }
    }

    if (mod.adminRoutes) {
      for (const r of mod.adminRoutes) {
        const method = r.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch'
        app[method](`/admin${r.path}`, authMiddleware, r.handler)
      }
    }

    if (mod.webhookRoutes) {
      for (const r of mod.webhookRoutes) {
        const method = r.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch'
        app[method](`/webhook${r.path}`, r.handler)
      }
    }
  }

  // ══════════════════════════════════════
  //  CORE ROUTES
  // ══════════════════════════════════════

  // ── Storefront Home ──
  app.get('/', async (c) => {
    const products = await events.emit('store:list-products')
    return renderStore(c, 'home', {
      title: 'Home',
      products: products[0] || [],
    })
  })

  // ── Admin Login ──
  app.get('/admin/login', (c) => {
    return renderAdmin(c, 'login', { title: 'Login', error: null })
  })

  app.post('/admin/login', async (c) => {
    const body = await c.req.parseBody()
    const username = body.username as string
    const password = body.password as string

    const token = await loginAdmin(username, password)
    if (!token) {
      return renderAdmin(c, 'login', { title: 'Login', error: 'Invalid credentials' })
    }

    setCookie(c, 'sellox_token', token, {
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return c.redirect('/admin')
  })

  // ── Admin Logout ──
  app.post('/admin/logout', (c) => {
    deleteCookie(c, 'sellox_token')
    return c.redirect('/admin/login')
  })

  // ── Admin Dashboard ──
  app.get('/admin', authMiddleware, async (c) => {
    const stats = await events.emit('admin:dashboard-stats')
    return renderAdmin(c, 'dashboard', {
      title: 'Dashboard',
      stats: stats.flat(),
    })
  })

  // ── Admin Settings ──
  app.get('/admin/settings', authMiddleware, async (c) => {
    const sections = []
    for (const mod of modules) {
      if (mod.adminSettings) {
        const fields = mod.adminSettings()
        const values: Record<string, string> = {}
        for (const field of fields) {
          values[field.key] = (await settings.get(field.key)) || field.default || ''
        }
        sections.push({
          name: mod.name,
          description: mod.description || '',
          fields,
          values,
        })
      }
    }
    return renderAdmin(c, 'settings', { title: 'Settings', sections })
  })

  app.post('/admin/settings', authMiddleware, async (c) => {
    const body = await c.req.parseBody()
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        await settings.set(key, value)
      }
    }
    return c.redirect('/admin/settings')
  })

  // ── Health Check ──
  app.get('/health', (c) => {
    return c.json({
      status: 'ok',
      name: 'Sellox',
      version: '1.0.0',
      modules: modules.map(m => m.name),
      uptime: process.uptime(),
    })
  })

  // ── 404 ──
  app.notFound((c) => {
    return c.html('<h1>404 — Not Found</h1>', 404)
  })

  // ── Start Server ──
  serve({ fetch: app.fetch, port: config.port }, () => {
    console.log(`🚀 Sellox running on http://localhost:${config.port}`)
    console.log(`🔐 Admin: http://localhost:${config.port}/admin`)
    console.log(`🏪 Store: http://localhost:${config.port}/`)
    console.log('')
  })
}

bootstrap().catch((err) => {
  console.error('💥 Failed to start:', err)
  process.exit(1)
})
