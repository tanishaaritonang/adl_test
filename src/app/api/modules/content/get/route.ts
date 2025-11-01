import { NextRequest } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    const level = searchParams.get('level')

    if (!moduleId || !level) {
      return new Response(
        JSON.stringify({ error: 'Module ID and level are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const query =
      'SELECT * FROM module_contents WHERE module_id = $1 AND level = $2'
    const { rows } = await pool.query(query, [moduleId, level])

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Module content not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        },
      )
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
