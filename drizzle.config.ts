import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: ['./core/db.ts', './modules/*/schema.ts'],
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
