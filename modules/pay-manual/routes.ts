import type { RouteDef } from '../../core/types.js'
import { renderModuleView } from '../../core/render.js'
import { listPendingOrders, completeOrder, getOrderById } from '../orders/service.js'
import { getProduct } from '../products/service.js'

export const adminRoutes: RouteDef[] = [
  {
    method: 'GET',
    path: '/pay-manual',
    handler: async (c) => {
      const pendingOrders = await listPendingOrders('manual')

      const ordersWithProducts = await Promise.all(
        pendingOrders.map(async (o) => ({
          ...o,
          product: await getProduct(o.productId),
        }))
      )

      return renderModuleView(c, 'pay-manual', 'admin-confirm', {
        title: 'Manual Payments',
        orders: ordersWithProducts,
      })
    },
  },
  {
    method: 'POST',
    path: '/pay-manual/confirm/:orderId',
    handler: async (c) => {
      const orderId = c.req.param('orderId')
      try {
        await completeOrder(orderId)
      } catch (e) {
        return c.text(`Error: ${(e as Error).message}`, 400)
      }
      return c.redirect('/admin/pay-manual')
    },
  },
]
