const config = {
  storeName: process.env.STORE_NAME || 'Sellox Store',
  storeDescription: process.env.STORE_DESC || 'Premium digital goods, instant delivery',
  currency: process.env.CURRENCY || 'USD',
  currencySymbol: process.env.CURRENCY_SYMBOL || '$',
  port: parseInt(process.env.PORT || '7860'),
  theme: 'default',
  colors: {
    primary: '#8b5cf6',
    surface: '#18181b',
    background: '#09090b',
    text: '#fafafa',
    accent: '#22c55e',
  },
  jwtSecret: process.env.JWT_SECRET || 'change-this-in-production-32chars!',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  databaseUrl: process.env.DATABASE_URL || '',
}

export default config
