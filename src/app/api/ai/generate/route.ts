import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'tinyllama' } = await request.json()

    // Validate environment variable
    if (!process.env.OLLAMA_API_URL) {
      return new Response(
        JSON.stringify({
          error: 'OLLAMA_API_URL environment variable is not set',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Prepare the payload for Ollama API
    const ollamaPayload = {
      model,
      prompt,
      stream: false, // We want the complete response
      options: {
        temperature: 0.7,
      },
    }

    // Call the Ollama API
    const response = await fetch(process.env.OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ollamaPayload),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Ollama API error:', errorData)
      return new Response(
        JSON.stringify({
          error: `Ollama API error: ${response.status} ${response.statusText}`,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const data = await response.json()

    // Return the AI response
    return new Response(
      JSON.stringify({
        response: data.response,
        model: data.model,
        total_duration: data.eval_duration,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('AI API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
