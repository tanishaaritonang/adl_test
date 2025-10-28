import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { topic, level, numQuestions = 30 } = await request.json()

    if (!process.env.OLLAMA_API_URL) {
      return new Response(
        JSON.stringify({
          error: 'OLLAMA_API_URL environment variable is not set',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Create a prompt for generating questions
    const prompt = `
      Generate ${numQuestions} multiple-choice questions about ${topic} for a ${level} level student. 
      Each question should have 4 options (A, B, C, D) and indicate the correct answer.
      Also include a brief explanation for each answer.
      
      Format the response as a JSON array with the following structure:
      [
        {
          "id": "unique-question-id",
          "text": "The question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0-3 (index of correct option),
          "explanation": "Brief explanation of the correct answer"
        }
      ]
      
      Keep the questions focused on ${topic} and ensure they are appropriate for the ${level} difficulty level.
      Make sure each question is unique and covers different aspects of ${topic}.
    `

    const ollamaPayload = {
      model: 'tinyllama',
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
      },
    }

    const ollamaResponse = await fetch(process.env.OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ollamaPayload),
    })

    if (!ollamaResponse.ok) {
      const errorData = await ollamaResponse.text()
      console.error('Ollama API error:', errorData)
      return new Response(
        JSON.stringify({
          error: `Ollama API error: ${ollamaResponse.status} ${ollamaResponse.statusText}`,
        }),
        {
          status: ollamaResponse.status,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const data = await ollamaResponse.json()

    try {
      // Try to parse the AI response as JSON
      const questions = JSON.parse(data.response)
      return new Response(JSON.stringify(questions), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.log('Raw response:', data.response)
      return new Response(
        JSON.stringify({ error: 'Error parsing AI response' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }
  } catch (error) {
    console.error('Generate Questions API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
