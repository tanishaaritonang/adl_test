// utils/ai/generateModuleContent.ts
// Improvement: JSON parser that handles ```json ... ```, noise, and "thinking"
// + force model to output JSON via 'format: "json"' (if model supports)

export type ModuleContent = {
  content_easy?: string
  content_medium?: string
  content_high?: string
  questions: {
    easy?: { mcq: Question[]; short: Question[] }
    medium?: { mcq: Question[]; short: Question[] }
    high?: { mcq: Question[]; short: Question[] }
  }
}

export type Question = {
  question: string
  options?: string[]
  answer: string
  explanation: string
}

type OllamaGenerateResponse = {
  response?: string // ollama generate default
  text?: string // beberapa model/tool menempatkan di 'text'
  // field lain diabaikan
}

const DEFAULT_API_URL = 'http://localhost:11434/api/generate'
const DEFAULT_MODEL = 'llama3.1:8b'

// ===== Helper: extract JSON object robustly =====
function extractJSONObject(raw: string): string {
  if (!raw) throw new Error('Empty AI response')

  // 1) Clean code fence ```json ... ```
  const fence =
    raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/```\s*([\s\S]*?)```/i)
  if (fence && fence[1]) {
    return fence[1].trim()
  }

  // 2) Find largest JSON object based on braces (stack-based)
  let startIndex = -1
  let best: { start: number; end: number } | null = null
  let depth = 0
  let inStr = false
  let esc = false
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (inStr) {
      if (esc) {
        esc = false
      } else if (ch === '\\') {
        esc = true
      } else if (ch === '"') {
        inStr = false
      }
      continue
    } else {
      if (ch === '"') {
        inStr = true
        continue
      }
      if (ch === '{') {
        if (depth === 0) startIndex = i
        depth++
      } else if (ch === '}') {
        depth--
        if (depth === 0 && startIndex !== -1) {
          const candidate = { start: startIndex, end: i + 1 }
          if (
            !best ||
            candidate.end - candidate.start > best.end - best.start
          ) {
            best = candidate
          }
          startIndex = -1
        }
      }
    }
  }
  if (best) {
    return raw.slice(best.start, best.end).trim()
  }

  // 3) If still fails, throw error with a small snippet for debugging
  const preview = raw.slice(0, Math.min(300, raw.length))
  throw new Error(
    `Could not extract JSON from AI response. Preview: ${preview}`,
  )
}

// ===== Helper: normalize minimal structure for validator =====
function coerceToModuleContent(obj: any): ModuleContent {
  const safeArray = (v: any) => (Array.isArray(v) ? v : [])
  const ensureString = (v: any) => (typeof v === 'string' ? v : '')

  const out: ModuleContent = {
    content_easy:
      obj?.content_easy !== undefined
        ? ensureString(obj?.content_easy)
        : undefined,
    content_medium:
      obj?.content_medium !== undefined
        ? ensureString(obj?.content_medium)
        : undefined,
    content_high:
      obj?.content_high !== undefined
        ? ensureString(obj?.content_high)
        : undefined,
    questions: {
      easy: obj?.questions?.easy
        ? {
            mcq: safeArray(obj?.questions?.easy?.mcq),
            short: safeArray(obj?.questions?.easy?.short),
          }
        : { mcq: [], short: [] },
      medium: obj?.questions?.medium
        ? {
            mcq: safeArray(obj?.questions?.medium?.mcq),
            short: safeArray(obj?.questions?.medium?.short),
          }
        : { mcq: [], short: [] },
      high: obj?.questions?.high
        ? {
            mcq: safeArray(obj?.questions?.high?.mcq),
            short: safeArray(obj?.questions?.high?.short),
          }
        : { mcq: [], short: [] },
    },
  }
  return out
}

// ===== Validator remains (tightened but informative) =====
function validateModuleContent(content: ModuleContent): void {
  const mustStr = (v: any, name: string) => {
    if (v !== undefined && (typeof v !== 'string' || v.length === 0))
      throw new Error(`Invalid ${name} in AI response`)
  }
  // Only validate fields that exist
  if (content.content_easy !== undefined)
    mustStr(content.content_easy, 'content_easy')
  if (content.content_medium !== undefined)
    mustStr(content.content_medium, 'content_medium')
  if (content.content_high !== undefined)
    mustStr(content.content_high, 'content_high')

  const levels: Array<keyof ModuleContent['questions']> = [
    'easy',
    'medium',
    'high',
  ]
  for (const level of levels) {
    const q = content.questions[level]
    if (!q || typeof q !== 'object') continue // Skip validation if the level doesn't exist
    if (!Array.isArray(q.mcq)) throw new Error(`Invalid questions.${level}.mcq`)
    if (!Array.isArray(q.short))
      throw new Error(`Invalid questions.${level}.short`)
    // Opsional: minimal 5 butir (jika kamu mau strict, aktifkan baris di bawah)
    // if (q.mcq.length < 5 || q.short.length < 5) {
    //   throw new Error(`Not enough questions for ${level}. Need >=5 MCQ and >=5 Short.`)
    // }
  }
}

// ===== Function to generate easy-level content =====
export const generateEasyContent = async (
  moduleText: string,
  moduleTitle: string,
  onStream?: (chunk: string) => void,
): Promise<Partial<ModuleContent>> => {
  const apiUrl = process.env.OLLAMA_API_URL || DEFAULT_API_URL
  const model = process.env.OLLAMA_MODEL || DEFAULT_MODEL

  // Prompt for easy-level content
  const prompt = `
You are to produce ONLY a JSON object, no markdown fences, no explanations, no "thinking".
Given a learning module titled "${moduleTitle}", with content (truncated):
"${moduleText.substring(0, 2000)}..."
Return ONLY valid JSON with these keys:
{
  "content_easy": "string — a clear and simple beginner-level explanation (at least 80 words). Avoid placeholders or repetition.",
  "questions": {
    "easy": {
      "mcq": [
        {
          "question": "string — basic question.",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "exactly one of the options above.",
          "explanation": "20-40 words explaining why the answer is correct."
        }
      ],
      "short": [
        {
          "question": "string — short-answer question for beginners.",
          "answer": "concise factual answer (1-2 sentences).",
          "explanation": "15-35 words explaining the concept clearly."
        }
      ]
    }
  }
}


Title: "${moduleTitle}"
Content: "${moduleText.substring(0, 500)}"
`.trim()

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false, // Disable streaming for reliable response
        options: { temperature: 0.7 },
      }),
    })

    if (!res.ok) {
      throw new Error('Ollama API error: ${res.status} ${res.statusText}')
    }

    const data: OllamaGenerateResponse = await res.json()
    const raw = data.response || data.text || ''

    // If onStream is provided, simulate streaming by outputting the full response at once
    if (onStream) {
      onStream(raw)
    } else {
      // Output to console with easy level indicator
      console.log(`[EASY] ${raw.substring(0, 200)}...`) // Log first 200 chars as preview
    }

    const jsonString = extractJSONObject(raw)

    let parsed: any
    try {
      parsed = JSON.parse(jsonString)
    } catch (e) {
      // Kadang model menyisipkan trailing koma → coba perbaikan ringan
      const relaxed = jsonString.replace(/,\s*([}\]])/g, '$1')
      parsed = JSON.parse(relaxed)
    }

    const coerced = coerceToModuleContent(parsed)
    validateModuleContent(coerced)
    return coerced
  } catch (err) {
    console.error('Error calling/parsing Ollama for easy content:', err)
    throw new Error('Invalid JSON response from AI model for easy content')
  }
}

// ===== Function to generate medium-level content =====
export const generateMediumContent = async (
  moduleText: string,
  moduleTitle: string,
  onStream?: (chunk: string) => void,
): Promise<Partial<ModuleContent>> => {
  const apiUrl = process.env.OLLAMA_API_URL || DEFAULT_API_URL
  const model = process.env.OLLAMA_MODEL || DEFAULT_MODEL

  // Prompt for medium-level content
  const prompt = `
You are to produce ONLY a JSON object, no markdown fences, no explanations, no "thinking".
Given a learning module titled "${moduleTitle}", with content (truncated):
"${moduleText.substring(0, 2000)}..."
Return ONLY valid JSON with these keys:
{
  "content_medium": "string — a detailed, intermediate-level explanation (at least 100 words). Cover key topics and examples.",
  "questions": {
    "medium": {
      "mcq": [
        {
          "question": "string — intermediate-level question.",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "exactly one of the options above.",
          "explanation": "20-40 words explaining why the answer is correct."
        }
      ],
      "short": [
        {
          "question": "string — intermediate-level short-answer question.",
          "answer": "concise factual answer (1-2 sentences).",
          "explanation": "15-35 words explaining the concept clearly."
        }
      ]
    }
  }
}


Title: "${moduleTitle}"
Content: "${moduleText.substring(0, 500)}"
`.trim()

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false, // Disable streaming for reliable response
        options: { temperature: 0.7 },
      }),
    })

    if (!res.ok) {
      throw new Error('Ollama API error: ${res.status} ${res.statusText}')
    }

    const data: OllamaGenerateResponse = await res.json()
    const raw = data.response || data.text || ''

    // If onStream is provided, simulate streaming by outputting the full response at once
    if (onStream) {
      onStream(raw)
    } else {
      // Output to console with medium level indicator
      console.log(`[MEDIUM] ${raw.substring(0, 200)}...`) // Log first 200 chars as preview
    }

    const jsonString = extractJSONObject(raw)

    let parsed: any
    try {
      parsed = JSON.parse(jsonString)
    } catch (e) {
      // Kadang model menyisipkan trailing koma → coba perbaikan ringan
      const relaxed = jsonString.replace(/,\s*([}\]])/g, '$1')
      parsed = JSON.parse(relaxed)
    }

    const coerced = coerceToModuleContent(parsed)
    validateModuleContent(coerced)
    return coerced
  } catch (err) {
    console.error('Error calling/parsing Ollama for medium content:', err)
    throw new Error('Invalid JSON response from AI model for medium content')
  }
}

// ===== Function to generate hard-level content =====
export const generateHardContent = async (
  moduleText: string,
  moduleTitle: string,
  onStream?: (chunk: string) => void,
): Promise<Partial<ModuleContent>> => {
  const apiUrl = process.env.OLLAMA_API_URL || DEFAULT_API_URL
  const model = process.env.OLLAMA_MODEL || DEFAULT_MODEL

  // Prompt for hard-level content
  const prompt = `
You are to produce ONLY a JSON object, no markdown fences, no explanations, no "thinking".
Given a learning module titled "${moduleTitle}", with content (truncated):
"${moduleText.substring(0, 2000)}..."
Return ONLY valid JSON with these keys:
{
  "content_high": "string — an advanced-level explanation (at least 120 words). Include applied/critical concepts and real-world relevance.",
  "questions": {
    "high": {
      "mcq": [
        {
          "question": "string — advanced-level question.",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "exactly one of the options above.",
          "explanation": "20-40 words explaining why the answer is correct."
        }
      ],
      "short": [
        {
          "question": "string — advanced-level short-answer question.",
          "answer": "concise factual answer (1-2 sentences).",
          "explanation": "15-35 words explaining the concept clearly."
        }
      ]
    }
  }
}


Title: "${moduleTitle}"
Content: "${moduleText.substring(0, 500)}"
`.trim()

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false, // Disable streaming for reliable response
        options: { temperature: 0.7 },
      }),
    })

    if (!res.ok) {
      throw new Error('Ollama API error: ${res.status} ${res.statusText}')
    }

    const data: OllamaGenerateResponse = await res.json()
    const raw = data.response || data.text || ''

    // If onStream is provided, simulate streaming by outputting the full response at once
    if (onStream) {
      onStream(raw)
    } else {
      // Output to console with hard level indicator
      console.log(`[HARD] ${raw.substring(0, 200)}...`) // Log first 200 chars as preview
    }

    const jsonString = extractJSONObject(raw)

    let parsed: any
    try {
      parsed = JSON.parse(jsonString)
    } catch (e) {
      // Kadang model menyisipkan trailing koma → coba perbaikan ringan
      const relaxed = jsonString.replace(/,\s*([}\]])/g, '$1')
      parsed = JSON.parse(relaxed)
    }

    const coerced = coerceToModuleContent(parsed)
    validateModuleContent(coerced)
    return coerced
  } catch (err) {
    console.error('Error calling/parsing Ollama for hard content:', err)
    throw new Error('Invalid JSON response from AI model for hard content')
  }
}

// ===== Main function: call Ollama & parse JSON =====
// Updated to generate all content levels separately, one by one
export const generateModuleContent = async (
  moduleText: string,
  moduleTitle: string,
  onStream?: (chunk: string) => void,
): Promise<ModuleContent> => {
  const result: ModuleContent = {
    questions: {
      easy: { mcq: [], short: [] },
      medium: { mcq: [], short: [] },
      high: { mcq: [], short: [] },
    },
  }

  try {
    // Generate easy content first
    console.log(`Generating easy content for: ${moduleTitle}`)
    const easyResult = await generateEasyContent(
      moduleText,
      moduleTitle,
      onStream,
    )
    if (easyResult.content_easy) result.content_easy = easyResult.content_easy
    if (easyResult.questions?.easy)
      result.questions.easy = easyResult.questions.easy

    // Generate medium content
    console.log(`Generating medium content for: ${moduleTitle}`)
    const mediumResult = await generateMediumContent(
      moduleText,
      moduleTitle,
      onStream,
    )
    if (mediumResult.content_medium)
      result.content_medium = mediumResult.content_medium
    if (mediumResult.questions?.medium)
      result.questions.medium = mediumResult.questions.medium

    // Generate hard content
    console.log(`Generating hard content for: ${moduleTitle}`)
    const hardResult = await generateHardContent(
      moduleText,
      moduleTitle,
      onStream,
    )
    if (hardResult.content_high) result.content_high = hardResult.content_high
    if (hardResult.questions?.high)
      result.questions.high = hardResult.questions.high

    return result
  } catch (err) {
    console.error('Error in generating module content:', err)
    throw err
  }
}

// ===== Student answer feedback: remains, only slightly updated =====
export const getFeedbackForAnswer = async (
  question: string,
  correctAnswer: string,
  studentAnswer: string,
  onStream?: (chunk: string) => void,
): Promise<string> => {
  const apiUrl = process.env.OLLAMA_API_URL || DEFAULT_API_URL
  const model = process.env.OLLAMA_MODEL || 'llama3.1:8b'
  const prompt = `
Provide concise formative feedback.

Question: ${question}
Correct Answer: ${correctAnswer}
Student Answer: ${studentAnswer}

- If correct: confirm & add one helpful insight.
- If incorrect: explain the mismatch and give 1 hint.
`.trim()

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false, // Disable streaming for reliable response
        options: { temperature: 0.3 },
      }),
    })
    if (!res.ok)
      throw new Error(`Ollama API error: ${res.status} ${res.statusText}`)

    const data: OllamaGenerateResponse = await res.json()
    const responseText = data.response || data.text || ''

    // If onStream is provided, simulate streaming by outputting the full response at once
    if (onStream) {
      onStream(responseText)
    } else {
      // Output to console with feedback indicator
      console.log(`[FEEDBACK] ${responseText.substring(0, 100)}...`) // Log first 100 chars as preview
    }

    return responseText || 'AI feedback is not available at this time.'
  } catch (e) {
    console.error('Error getting feedback from Ollama:', e)
    return 'AI feedback is not available at this time.'
  }
}
