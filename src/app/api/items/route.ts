import { NextRequest } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check if body is an array (multiple items) or single item
    if (Array.isArray(body)) {
      // Handle multiple items
      const items = body

      if (items.length === 0) {
        return new Response(JSON.stringify({ error: 'No items provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Handle multiple items
      const placeholders = items
        .map(
          (_, index) =>
            `($${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, $${index * 8 + 4}, $${index * 8 + 5}, $${index * 8 + 6}, $${index * 8 + 7}, $${index * 8 + 8})`,
        )
        .join(', ')
      const query = `
        INSERT INTO items (module_id, level, type, question_type, question, options, answer, explanation) 
        VALUES ${placeholders}
        RETURNING *
      `

      // Flatten the items array to match query parameters
      const values = items.flatMap((item) => [
        item.module_id,
        item.level,
        item.type,
        item.question_type,
        item.question,
        item.options,
        item.answer,
        item.explanation,
      ])

      const { rows } = await pool.query(query, values)

      return new Response(JSON.stringify(rows), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    } else {
      // Handle single item
      const {
        module_id,
        level,
        type,
        question_type,
        question,
        options,
        answer,
        explanation,
      } = body

      const query = `
        INSERT INTO items (module_id, level, type, question_type, question, options, answer, explanation) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *
      `
      const { rows } = await pool.query(query, [
        module_id,
        level,
        type,
        question_type,
        question,
        options,
        answer,
        explanation,
      ])

      return new Response(JSON.stringify(rows[0]), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Database error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
