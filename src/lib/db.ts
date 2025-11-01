import { Pool } from 'pg'

// Create PostgreSQL connection pool
export const pool = new Pool({
  host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT || '5432'),
  database: process.env.POSTGRES_DB || process.env.DB_NAME || 'app_db',
  user: process.env.POSTGRES_USER || process.env.DB_USER || 'postgres',
  password:
    process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'postgres',
})

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Database connection error:', err)
})

export default pool
