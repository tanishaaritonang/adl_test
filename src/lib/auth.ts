import { betterAuth } from 'better-auth'
import { kyselyAdapter } from 'better-auth/adapters/kysely-adapter'
import { Pool } from 'pg'

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'app_db',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
})

// Initialize Better Auth with Kysely adapter for PostgreSQL
export const auth = betterAuth({
  database: kyselyAdapter(pool, {
    provider: 'postgresql',
  }),
  // User configuration
  user: {
    // Enable email/password authentication
    email: true,
    password: {
      enabled: true,
    },
  },
  // Session configuration
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    rememberMe: true,
  },
})

// Export auth client for client-side use
export const { signIn, signUp, signOut } = auth
