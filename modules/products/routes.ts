import type { RouteDef } from '../../core/types.js'
import { renderStore, renderModuleView } from '../../core/render.js'
import { getAppContext } from '../../core/context.js'
import * as svc from './service.js'

// ── Store Routes ──
export const storeRoutes: RouteDef[] = [
  {
    method: 'GET',
    path: '/product/:slug',
    handler: async (c) => {
      const slug = c.req.param('slug')
      const product = await svc.getProduct(slug)
      if (!product) return c.text('Product not found', 404)

      const { events } = getAppContext()
      const stockCounts = await events.emit('stock:count', product.id)
      const stockCount = stockCounts[0] || 0

      const paymentMethods = await events.emit('checkout:payment-methods')

      return renderStore(c, 'product', {
        title: product.title,
        product,
        stockCount,
        paymentMethods,
      })
    },
  },
]

// ── Admin Routes ──
export const adminRoutes: RouteDef[] = [
  {
    method: 'GET',
    path: '/products',
    handler: async (c) => {
      const products = await svc.listProducts()
      const { events } = getAppContext()

      const productsWithStock = await Promise.all(
        products.map(async (p) => {
          const counts = await events.emit('stock:count', p.id)
          return { ...p, stockCount: counts[0] || 0 }
        })
      )

      return renderModuleView(c, 'products', 'admin-list', {
        title: 'Products',
        products: productsWithStock,
      })
    },
  },
  {
    method: 'GET',
    path: '/products/new',
    handler: async (c) => {
      return renderModuleView(c, 'products', 'admin-edit', {
        title: 'New Product',
        product: null,
        isNew: true,
      })
    },
  },
  {
    method: 'GET',
    path: '/products/:id/edit',
    handler: async (c) => {
      const product = await svc.getProduct(c.req.param('id'))
      if (!product) return c.text('Not found', 404)
      return renderModuleView(c, 'products', 'admin-edit', {
        title: `Edit: ${product.title}`,
        product,
        isNew: false,
      })
    },
  },
  {
    method: 'POST',
    path: '/products',
    handler: async (c) => {
      const body = await c.req.parseBody()
      await svc.createProduct({
        title: body.title as string,
        description: body.description as string,
        price: Math.round(parseFloat(body.price as string) * 100),
        imageUrl: body.imageUrl as string,
      })
      return c.redirect('/admin/products')
    },
  },
  {
    method: 'POST',
    path: '/products/:id/update',
    handler: async (c) => {
      const id = c.req.param('id')
      const body = await c.req.parseBody()
      await svc.updateProduct(id, {
        title: body.title as string,
        description: body.description as string,
        price: Math.round(parseFloat(body.price as string) * 100),
        imageUrl: body.imageUrl as string,
        isActive: body.isActive === 'on',
      })
      return c.redirect('/admin/products')
    },
  },
  {
    method: 'POST',
    path: '/products/:id/delete',
    handler: async (c) => {
      await svc.deleteProduct(c.req.param('id'))
      return c.redirect('/admin/products')
    },
  },
]
