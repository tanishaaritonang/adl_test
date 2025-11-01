import { NextRequest } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')

    if (!moduleId) {
      return new Response(JSON.stringify({ error: 'Module ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const query = 'SELECT * FROM module_contents WHERE module_id = $1'
    const { rows } = await pool.query(query, [moduleId])

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
