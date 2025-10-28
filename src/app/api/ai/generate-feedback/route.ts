import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { preTestScore, postTestScore, topic, level, answers } =
      await request.json()

    if (!process.env.OLLAMA_API_URL) {
      return new Response(
        JSON.stringify({
          error: 'OLLAMA_API_URL environment variable is not set',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Create a prompt for generating feedback
    const prompt = `
      Generate personalized feedback for a student who completed the ${topic} module.
      Pre-test score: ${preTestScore}%
      Post-test score: ${postTestScore}%
      Level: ${level}
      
      Provide feedback that includes:
      1. An assessment of the student's performance
      2. Recognition of improvement (or lack thereof)
      3. Specific areas of strength
      4. Areas that need improvement
      5. Recommendations for next steps
      
      Format the response as a JSON object with the following structure:
      {
        "summary": "A brief summary of the performance",
        "strengths": ["List of strengths"],
        "improvements": ["List of areas for improvement"],
        "recommendations": ["List of recommendations for future learning"]
      }
      
      The feedback should be encouraging but honest, appropriate for the student's level,
      and actionable for future learning.
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
      const feedback = JSON.parse(data.response)
      return new Response(JSON.stringify(feedback), {
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
    console.error('Generate Feedback API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
