import type { RouteDef } from '../../core/types.js'
import { renderStore, renderModuleView } from '../../core/render.js'
import { getAppContext } from '../../core/context.js'
import * as svc from './service.js'
import { getProduct } from '../products/service.js'
import config from '../../sellox.config.js'

export const storeRoutes: RouteDef[] = [
  // ── Checkout POST ──
  {
    method: 'POST',
    path: '/checkout',
    handler: async (c) => {
      const body = await c.req.parseBody()
      const { events } = getAppContext()

      const productId = body.productId as string
      const email = body.email as string
      const quantity = parseInt(body.quantity as string) || 1
      const paymentMethod = body.paymentMethod as string

      const product = await getProduct(productId)
      if (!product) return c.text('Product not found', 404)

      // Create order
      const totalAmount = product.price * quantity
      const { id, publicId } = await svc.createOrder({
        email,
        productId: product.id,
        quantity,
        totalAmount,
        currency: config.currency,
        paymentMethod,
        ipAddress: c.req.header('x-forwarded-for') || 'unknown',
      })

      // Get payment instructions from the relevant payment module
      const paymentResults = await events.emit('payment:create', {
        order: { id, publicId, email, totalAmount, currency: config.currency, productId },
        method: paymentMethod,
      })

      const paymentInfo = paymentResults.find(r => r !== null) || { type: 'unknown' }

      return renderStore(c, 'checkout', {
        title: 'Complete Payment',
        order: { id, publicId, email, totalAmount, quantity },
        product,
        paymentInfo,
        paymentMethod,
      })
    },
  },

  // ── Order Status ──
  {
    method: 'GET',
    path: '/order/:publicId',
    handler: async (c) => {
      const publicId = c.req.param('publicId')
      const order = await svc.getOrder(publicId)
      if (!order) return c.text('Order not found', 404)

      const product = await getProduct(order.productId)

      return renderStore(c, 'order-status', {
        title: `Order ${publicId}`,
        order,
        product,
      })
    },
  },

  // ── Order Lookup ──
  {
    method: 'GET',
    path: '/orders',
    handler: async (c) => {
      return renderStore(c, 'order-status', {
        title: 'Order Lookup',
        order: null,
        product: null,
        lookupMode: true,
      })
    },
  },
  {
    method: 'POST',
    path: '/orders/lookup',
    handler: async (c) => {
      const body = await c.req.parseBody()
      const query = (body.query as string).trim()

      let order = await svc.getOrder(query)
      if (!order) {
        const byEmail = await svc.getOrdersByEmail(query)
        if (byEmail.length > 0) order = byEmail[0]
      }

      const product = order ? await getProduct(order.productId) : null

      return renderStore(c, 'order-status', {
        title: 'Order Lookup',
        order,
        product,
        lookupMode: true,
        query,
        notFound: !order,
      })
    },
  },
]

export const adminRoutes: RouteDef[] = [
  {
    method: 'GET',
    path: '/orders',
    handler: async (c) => {
      const ordersList = await svc.listOrders()
      return renderModuleView(c, 'orders', 'admin-list', {
        title: 'Orders',
        orders: ordersList,
      })
    },
  },
  {
    method: 'GET',
    path: '/orders/:id',
    handler: async (c) => {
      const id = c.req.param('id')
      const order = await svc.getOrderById(id) || await svc.getOrder(id)
      if (!order) return c.text('Order not found', 404)

      const product = await getProduct(order.productId)

      return renderModuleView(c, 'orders', 'admin-detail', {
        title: `Order ${order.publicId}`,
        order,
        product,
      })
    },
  },
]
