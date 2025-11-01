import { NextRequest } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    const type = searchParams.get('type')
    const level = searchParams.get('level') // Optional level parameter

    if (!moduleId || !type) {
      return new Response(
        JSON.stringify({ error: 'Module ID and type are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    let query = 'SELECT * FROM items WHERE module_id = $1 AND type = $2'
    let params = [moduleId, type]
    let paramIndex = 3

    if (level) {
      query += ` AND level = $${paramIndex}`
      params.push(level)
    }

    const { rows } = await pool.query(query, params)

    return new Response(JSON.stringify(rows), {
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
