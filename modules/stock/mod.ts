import type { SelloxModule } from '../../core/types.js'
import { adminRoutes } from './routes.js'
import { countStock, allocateStock } from './service.js'

export default {
  name: 'stock',
  version: '1.0.0',
  description: 'Stock pool management',

  adminRoutes,

  adminMenu: () => [
    { label: 'Stock', icon: '🗃️', path: '/stock', order: 2 },
  ],

  hooks: {
    'stock:count': (productId: string) => countStock(productId),
    'stock:allocate': ({ productId, quantity, orderId }: any) =>
      allocateStock(productId, quantity, orderId),
  },
} satisfies SelloxModule
