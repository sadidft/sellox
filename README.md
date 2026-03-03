# 🧬 Sellox

**The Modular Digital Store Engine**

> Your store, your rules, your code.

Sellox is a minimal, modular, self-hosted digital goods store. Upload stock (serials, credentials, accounts) → customers buy → auto-deliver. Like Sellix, but open-source and yours.

## Features

- 📦 Product catalog with stock pool
- 💳 Payment: PayPal, Crypto (NOWPayments), Bank Transfer
- 🔌 Modular architecture — add/remove features by adding/removing folders
- 🎨 Themeable storefront (EJS templates)
- 🔐 Admin panel with JWT auth
- ⚙️ Module-based settings (auto-rendered)
- 📡 Event system for module communication
- 🐳 Docker-ready, HuggingFace Spaces compatible
- 💰 Zero monthly cost (free tier stack)

## Quick Start

```bash
# Clone
git clone https://github.com/synavy/sellox.git
cd sellox

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, etc.

# Run
npm run dev
```

Open `http://localhost:7860`
Admin: `http://localhost:7860/admin` (default: admin / admin123)

## Stack

| Component | Tech |
|-----------|------|
| Server | Hono (14KB) |
| ORM | Drizzle |
| Database | MySQL / TiDB Cloud (free) |
| Templates | EJS + HTMX |
| Styling | Tailwind CSS |
| Runtime | Node.js 20 + tsx |

## Environment Variables

```env
DATABASE_URL=mysql://user:pass@host:port/sellox?ssl={"rejectUnauthorized":true}
JWT_SECRET=your-random-secret-at-least-32-characters
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme
STORE_NAME=My Store
STORE_DESC=Premium digital goods
CURRENCY=USD
CURRENCY_SYMBOL=$
PORT=7860
```

## Modules

```
modules/
├── products/     📦 Product CRUD
├── orders/       📋 Order processing
├── stock/        🗃️ Stock pool management
├── pay-paypal/   💳 PayPal gateway
├── pay-crypto/   ₿  NOWPayments gateway
├── pay-manual/   🏦 Bank transfer
└── emails/       📧 Email notifications
```

### Create Your Own Module

```
modules/my-module/
├── mod.ts        # Module definition (required)
├── routes.ts     # Route handlers
├── service.ts    # Business logic
├── schema.ts     # Database tables + createSQL
└── views/        # Admin EJS templates
```

```typescript
// modules/my-module/mod.ts
import type { SelloxModule } from '../../core/types.js'

export default {
  name: 'my-module',
  version: '1.0.0',

  adminMenu: () => [
    { label: 'My Module', icon: '��', path: '/my-module', order: 50 }
  ],

  hooks: {
    'admin:dashboard-stats': async () => ({
      label: 'Custom',
      value: 42,
      icon: '🔮',
    }),
  },
} satisfies SelloxModule
```

Drop it in `modules/` → restart → it works.

## Deploy to HuggingFace Spaces

1. Create new Space (Docker SDK)
2. Add Secrets: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD`
3. Push code
4. Done!

## License

AGPL-3.0 — Free to use, modify, distribute. Must keep open source.

---
**Built by [synavy](https://github.com/synavy)**
