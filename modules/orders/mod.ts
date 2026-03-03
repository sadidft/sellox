import type { SelloxModule } from '../../core/types.js'
import { storeRoutes, adminRoutes } from './routes.js'
import { countOrders, getTotalRevenue, countPendingOrders } from './service.js'
import config from '../../sellox.config.js'

export default {
  name: 'orders',
  version: '1.0.0',
  description: 'Order processing',

  routes: storeRoutes,
  adminRoutes,

  adminMenu: () => [
    { label: 'Orders', icon: '📋', path: '/orders', order: 3 },
  ],

  hooks: {
    'admin:dashboard-stats': async () => [
      {
        label: 'Orders',
        value: await countOrders(),
        icon: '📋',
      },
      {
        label: 'Pending',
        value: await countPendingOrders(),
        icon: '⏳',
      },
      {
        label: 'Revenue',
        value: config.currencySymbol + (await getTotalRevenue() / 100).toFixed(2),
        icon: '💰',
      },
    ],
  },
} satisfies SelloxModule
