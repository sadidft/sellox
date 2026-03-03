import type { SelloxModule } from '../../core/types.js'
import { adminRoutes } from './routes.js'
import { getManualSettings } from './service.js'
import { listPendingOrders } from '../orders/service.js'

export default {
  name: 'pay-manual',
  version: '1.0.0',
  description: 'Manual bank transfer payment',

  adminRoutes,

  adminMenu: () => [
    { label: 'Manual Pay', icon: '🏦', path: '/pay-manual', order: 20 },
  ],

  adminSettings: () => [
    { key: 'manual_bank_name', label: 'Bank Name', type: 'text' as const, default: 'BCA' },
    { key: 'manual_account_number', label: 'Account Number', type: 'text' as const },
    { key: 'manual_account_name', label: 'Account Holder', type: 'text' as const },
    { key: 'manual_instructions', label: 'Instructions', type: 'textarea' as const, default: 'Transfer the exact amount.' },
  ],

  hooks: {
    'checkout:payment-methods': () => ({
      id: 'manual',
      label: 'Bank Transfer',
      icon: '🏦',
    }),

    'payment:create': async ({ order, method }: any) => {
      if (method !== 'manual') return null
      const settings = await getManualSettings()
      return {
        type: 'manual',
        ...settings,
        amount: order.totalAmount,
      }
    },
  },
} satisfies SelloxModule
