import ejs from 'ejs'
import path from 'path'
import type { Context } from 'hono'
import config from '../sellox.config.js'
import { getAppContext } from './context.js'

function getStoreData() {
  return {
    name: config.storeName,
    description: config.storeDescription,
    currency: config.currency,
    currencySymbol: config.currencySymbol,
    colors: config.colors,
    theme: config.theme,
  }
}

function getAdminData(c: Context) {
  const ctx = getAppContext()
  const currentPath = new URL(c.req.url, 'http://localhost').pathname.replace('/admin', '') || '/'
  return {
    store: getStoreData(),
    menuItems: ctx.menuItems,
    currentPath,
  }
}

export async function renderStore(c: Context, template: string, data: Record<string, any> = {}) {
  const themePath = path.join(process.cwd(), 'themes', config.theme)
  const templatePath = path.join(themePath, `${template}.ejs`)
  const layoutPath = path.join(themePath, 'layout.ejs')

  const store = getStoreData()
  const body = await ejs.renderFile(templatePath, { ...data, store })
  const html = await ejs.renderFile(layoutPath, { body, title: data.title || '', store })

  return c.html(html)
}

export async function renderAdmin(c: Context, template: string, data: Record<string, any> = {}) {
  const adminPath = path.join(process.cwd(), 'admin')
  const templatePath = path.join(adminPath, `${template}.ejs`)
  const layoutPath = path.join(adminPath, 'layout.ejs')

  const adminData = getAdminData(c)
  const body = await ejs.renderFile(templatePath, { ...data, ...adminData })
  const html = await ejs.renderFile(layoutPath, { body, ...data, ...adminData })

  return c.html(html)
}

export async function renderModuleView(c: Context, moduleName: string, view: string, data: Record<string, any> = {}) {
  const viewPath = path.join(process.cwd(), 'modules', moduleName, 'views', `${view}.ejs`)
  const layoutPath = path.join(process.cwd(), 'admin', 'layout.ejs')

  const adminData = getAdminData(c)
  const body = await ejs.renderFile(viewPath, { ...data, ...adminData })
  const html = await ejs.renderFile(layoutPath, { body, ...data, ...adminData })

  return c.html(html)
}

// Render without layout (for HTMX partial responses)
export async function renderPartial(c: Context, templatePath: string, data: Record<string, any> = {}) {
  const store = getStoreData()
  const html = await ejs.renderFile(templatePath, { ...data, store })
  return c.html(html)
}
