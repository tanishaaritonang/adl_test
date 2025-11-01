import { NextRequest } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, module_id, level, score } = body

    const query = `
      INSERT INTO placements (user_id, module_id, level, score) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (user_id, module_id) 
      DO UPDATE SET level = EXCLUDED.level, score = EXCLUDED.score, updated_at = NOW()
      RETURNING *
    `
    const { rows } = await pool.query(query, [user_id, module_id, level, score])

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const moduleId = searchParams.get('moduleId')

    if (!userId || !moduleId) {
      return new Response(
        JSON.stringify({ error: 'User ID and Module ID are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const query =
      'SELECT * FROM placements WHERE user_id = $1 AND module_id = $2'
    const { rows } = await pool.query(query, [userId, moduleId])

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Placement not found' }), {
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
