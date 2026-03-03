import type { RouteDef } from '../../core/types.js'
import { renderModuleView } from '../../core/render.js'
import * as svc from './service.js'
import { getProduct } from '../products/service.js'

export const adminRoutes: RouteDef[] = [
  {
    method: 'GET',
    path: '/stock/:productId',
    handler: async (c) => {
      const productId = c.req.param('productId')
      const product = await getProduct(productId)
      if (!product) return c.text('Product not found', 404)

      const items = await svc.getStockItems(productId)
      const available = items.filter(i => i.status === 'available')
      const sold = items.filter(i => i.status === 'sold')

      return renderModuleView(c, 'stock', 'admin-manage', {
        title: `Stock: ${product.title}`,
        product,
        available,
        sold,
      })
    },
  },
  {
    method: 'POST',
    path: '/stock/:productId/add',
    handler: async (c) => {
      const productId = c.req.param('productId')
      const body = await c.req.parseBody()
      const content = body.content as string

      if (content.trim()) {
        await svc.addStockItem(productId, content.trim())
      }

      return c.redirect(`/admin/stock/${productId}`)
    },
  },
  {
    method: 'POST',
    path: '/stock/:productId/bulk',
    handler: async (c) => {
      const productId = c.req.param('productId')
      const body = await c.req.parseBody()
      const bulkText = body.bulk as string
      const delimiter = (body.delimiter as string) || '\n'

      const items = bulkText.split(delimiter === '---' ? '---' : '\n')
      await svc.addStockBulk(productId, items)

      return c.redirect(`/admin/stock/${productId}`)
    },
  },
  {
    method: 'POST',
    path: '/stock/delete/:id',
    handler: async (c) => {
      const id = c.req.param('id')
      const referer = c.req.header('referer') || '/admin'
      await svc.deleteStockItem(id)
      return c.redirect(referer)
    },
  },
]
