import { NextRequest } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { module_id, level, content } = body

    // Use upsert to insert or update content based on module_id and level
    const query = `
      INSERT INTO module_contents (module_id, level, content) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (module_id, level) 
      DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
      RETURNING *
    `
    const { rows } = await pool.query(query, [module_id, level, content])

    return new Response(JSON.stringify(rows[0]), {
      status: 200, // Using 200 since it's an upsert operation
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Database error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
