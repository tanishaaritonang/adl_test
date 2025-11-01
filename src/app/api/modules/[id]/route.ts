import { NextRequest } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const moduleId = params.id

    if (!moduleId) {
      return new Response(JSON.stringify({ error: 'Module ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const query = 'SELECT * FROM modules WHERE id = $1'
    const { rows } = await pool.query(query, [moduleId])

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Module not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(rows[0]), {
      status: 200,
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
