import { NextRequest } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, item_id, selected_answer, ai_feedback, is_correct } = body

    const query = `
      INSERT INTO attempts (user_id, item_id, selected_answer, ai_feedback, is_correct) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `
    const { rows } = await pool.query(query, [
      user_id,
      item_id,
      selected_answer,
      ai_feedback,
      is_correct,
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
