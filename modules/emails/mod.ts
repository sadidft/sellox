import type { SelloxModule } from '../../core/types.js'
import { sendEmail } from './service.js'

export default {
  name: 'emails',
  version: '0.1.0',
  description: 'Email notifications (Phase 2)',

  adminSettings: () => [
    { key: 'email_provider', label: 'Provider', type: 'select' as const, options: ['none', 'resend', 'smtp'], default: 'none' },
    { key: 'email_resend_key', label: 'Resend API Key', type: 'password' as const },
    { key: 'email_from', label: 'From Email', type: 'text' as const, default: 'noreply@example.com' },
  ],

  hooks: {
    'order:completed': async (order: any) => {
      await sendEmail(
        order.email,
        `Order ${order.publicId} Completed`,
        `Your order has been delivered. Check: /order/${order.publicId}`
      )
    },
  },
} satisfies SelloxModule
