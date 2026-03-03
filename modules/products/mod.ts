import type { SelloxModule } from '../../core/types.js'
import { storeRoutes, adminRoutes } from './routes.js'
import { listProducts, getProduct, countProducts } from './service.js'

export default {
  name: 'products',
  version: '1.0.0',
  description: 'Product catalog management',

  routes: storeRoutes,
  adminRoutes,

  adminMenu: () => [
    { label: 'Products', icon: '📦', path: '/products', order: 1 },
  ],

  hooks: {
    'store:list-products': () => listProducts(true),
    'store:get-product': (slug: string) => getProduct(slug),
    'admin:dashboard-stats': async () => ({
      label: 'Products',
      value: await countProducts(),
      icon: '📦',
    }),
  },
} satisfies SelloxModule
