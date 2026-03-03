import type { SelloxModule } from '../../core/types.js'

export default {
  name: 'pay-crypto',
  version: '0.1.0',
  description: 'Cryptocurrency payments via NOWPayments (Phase 2)',

  adminSettings: () => [
    { key: 'crypto_api_key', label: 'NOWPayments API Key', type: 'text' as const },
    { key: 'crypto_ipn_secret', label: 'IPN Secret', type: 'password' as const },
  ],

  hooks: {
    'checkout:payment-methods': () => ({
      id: 'crypto',
      label: 'Crypto',
      icon: '₿',
    }),

    'payment#create': async ({ order, method }: any) => {
      if (method !== 'crypto') return null
      return { type: 'crypto', message: 'Crypto payments coming soon. Use Bank Transfer.' }
    },
  },
} satisfies SelloxModule
