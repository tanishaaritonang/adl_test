import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { topic, level, numItems = 10 } = await request.json()

    if (!process.env.OLLAMA_API_URL) {
      return new Response(
        JSON.stringify({
          error: 'OLLAMA_API_URL environment variable is not set',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Create a prompt for generating learning materials
    const prompt = `
      Generate ${numItems} learning materials about ${topic} for a ${level} level student. 
      Each learning material should have a title and content explaining the concept.
      The content should be detailed enough to teach the concept but not too overwhelming.
      
      Format the response as a JSON array with the following structure:
      [
        {
          "id": "unique-item-id",
          "title": "Title of the learning item",
          "content": "Detailed content explaining the concept in a clear way"
        }
      ]
      
      Ensure the learning materials are appropriate for the ${level} difficulty level and cover various aspects of ${topic}.
      The materials should build on each other to create a comprehensive learning path.
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
      const learningMaterials = JSON.parse(data.response)
      return new Response(JSON.stringify(learningMaterials), {
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
    console.error('Generate Learning Materials API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
