import { NextRequest } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    // Get all modules with ordering by created_at
    const query = 'SELECT * FROM modules ORDER BY created_at DESC'
    const { rows } = await pool.query(query)

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { instructor_id, title, description } = body

    const query = `
      INSERT INTO modules (instructor_id, title, description) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `
    const { rows } = await pool.query(query, [
      instructor_id,
      title,
      description,
    ])

    return new Response(JSON.stringify(rows[0]), {
      status: 201,
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
