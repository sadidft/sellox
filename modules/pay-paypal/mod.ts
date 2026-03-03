import type { SelloxModule } from '../../core/types.js'

export default {
  name: 'pay-paypal',
  version: '0.1.0',
  description: 'PayPal payment gateway (Phase 2)',

  adminSettings: () => [
    { key: 'paypal_client_id', label: 'Client ID', type: 'text' as const, hint: 'From developer.paypal.com' },
    { key: 'paypal_secret', label: 'Client Secret', type: 'password' as const },
    { key: 'paypal_mode', label: 'Mode', type: 'select' as const, options: ['sandbox', 'live'], default: 'sandbox' },
  ],

  hooks: {
    'checkout:payment-methods': () => ({
      id: 'paypal',
      label: 'PayPal',
      icon: '💳',
    }),

    'payment:create': async ({ order, method }: any) => {
      if (method !== 'paypal') return null
      return { type: 'paypal', message: 'PayPal coming soon. Use Bank Transfer.' }
    },
  },
} satisfies SelloxModule
