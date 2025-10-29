import { env } from 'process'

// Define types for the AI-generated content
export type ModuleContent = {
  content_easy: string
  content_medium: string
  content_high: string
  questions: {
    easy: {
      mcq: Question[]
      short: Question[]
    }
    medium: {
      mcq: Question[]
      short: Question[]
    }
    high: {
      mcq: Question[]
      short: Question[]
    }
  }
}

export type Question = {
  question: string
  options?: string[]
  answer: string
  explanation: string
}

// Function to generate module content using Ollama
export const generateModuleContent = async (
  moduleText: string,
  moduleTitle: string,
): Promise<ModuleContent> => {
  // Check if OLLAMA_API_URL is configured
  const apiUrl =
    process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate'
  const model = process.env.OLLAMA_MODEL || 'tinyllama'

  if (!apiUrl) {
    throw new Error('OLLAMA_API_URL environment variable is not set')
  }

  // Construct the prompt for the AI model
  const prompt = `
    For the uploaded module about "${moduleTitle}", which contains the following content:
    "${moduleText.substring(0, 2000)}..."
    
    Please generate:
    1. Easy, Medium, and High level learning summaries.
    2. 5 multiple-choice and 5 short-answer questions per level.
    
    Format your response as valid JSON with the following structure:
    {
      "content_easy": "...",
      "content_medium": "...", 
      "content_high": "...",
      "questions": {
        "easy": {
          "mcq": [
            {
              "question": "...",
              "options": ["...", "...", "...", "..."],
              "answer": "...",
              "explanation": "..."
            }
          ],
          "short": [
            {
              "question": "...",
              "answer": "...",
              "explanation": "..."
            }
          ]
        },
        "medium": {
          "mcq": [...],
          "short": [...]
        },
        "high": {
          "mcq": [...],
          "short": [...]
        }
      }
    }
    
    Make sure to generate different content and questions for each difficulty level, with Easy being basic concepts, Medium being intermediate understanding, and High being advanced application.
  `

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false, // We want a complete response
        options: {
          temperature: 0.7, // A bit creative but consistent
        },
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Ollama API error: ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()

    // Extract the JSON from the response
    const text = data.response || data.text || ''

    // Find JSON within the response text
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}') + 1

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      const jsonString = text.substring(jsonStart, jsonEnd)

      try {
        const parsedContent = JSON.parse(jsonString) as ModuleContent

        // Validate the structure
        validateModuleContent(parsedContent)

        return parsedContent
      } catch (parseError) {
        console.error('Error parsing AI response JSON:', parseError)
        console.error('Raw response:', text)
        throw new Error('Invalid JSON response from AI model')
      }
    } else {
      throw new Error(`Could not extract JSON from AI response: ${text}`)
    }
  } catch (error) {
    console.error('Error calling Ollama API:', error)
    throw error
  }
}

// Validate the structure of the generated content
const validateModuleContent = (content: ModuleContent): void => {
  if (!content.content_easy || typeof content.content_easy !== 'string') {
    throw new Error('Invalid content_easy in AI response')
  }
  if (!content.content_medium || typeof content.content_medium !== 'string') {
    throw new Error('Invalid content_medium in AI response')
  }
  if (!content.content_high || typeof content.content_high !== 'string') {
    throw new Error('Invalid content_high in AI response')
  }

  if (!content.questions || typeof content.questions !== 'object') {
    throw new Error('Invalid questions structure in AI response')
  }

  for (const level of ['easy', 'medium', 'high']) {
    const levelQuestions =
      content.questions[level as keyof typeof content.questions]
    if (!levelQuestions || typeof levelQuestions !== 'object') {
      throw new Error(`Invalid ${level} questions structure in AI response`)
    }

    if (!Array.isArray(levelQuestions.mcq)) {
      throw new Error(`Invalid MCQ questions array for ${level} in AI response`)
    }

    if (!Array.isArray(levelQuestions.short)) {
      throw new Error(
        `Invalid short answer questions array for ${level} in AI response`,
      )
    }
  }
}

// Function to get feedback for a student answer
export const getFeedbackForAnswer = async (
  question: string,
  correctAnswer: string,
  studentAnswer: string,
): Promise<string> => {
  const apiUrl =
    process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate'
  const model = process.env.OLLAMA_MODEL || 'tinyllama'

  const prompt = `
    Question: ${question}
    Correct Answer: ${correctAnswer}
    Student Answer: ${studentAnswer}
    
    Provide brief, constructive feedback based on how well the student's answer matches the correct answer.
    If the student's answer is correct, confirm it and provide additional insight.
    If incorrect, explain what was wrong and provide hints for the correct answer.
    Keep the feedback concise but helpful.
  `

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.3, // More deterministic for feedback
        },
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Ollama API error: ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()
    return (
      data.response || data.text || 'AI feedback is not available at this time.'
    )
  } catch (error) {
    console.error('Error getting feedback from Ollama:', error)
    return 'AI feedback is not available at this time.'
  }
}
