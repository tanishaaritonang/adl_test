// utils/ai/generateModuleContent.ts
// Perbaikan: parser JSON yang tahan terhadap ```json ... ```, noise, dan "thinking"
// + paksa model keluarkan JSON via 'format: "json"' (jika model mendukung)

export type ModuleContent = {
  content_easy: string
  content_medium: string
  content_high: string
  questions: {
    easy: { mcq: Question[]; short: Question[] }
    medium: { mcq: Question[]; short: Question[] }
    high: { mcq: Question[]; short: Question[] }
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
const DEFAULT_MODEL = 'deepseek-r1:1.5b'

// ===== Helper: ekstrak objek JSON secara robust =====
function extractJSONObject(raw: string): string {
  if (!raw) throw new Error('Empty AI response')

  // 1) Bersihkan code fence ```json ... ```
  const fence =
    raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/```\s*([\s\S]*?)```/i)
  if (fence && fence[1]) {
    return fence[1].trim()
  }

  // 2) Cari objek JSON terbesar berbasis kurung kurawal (stack-based)
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

  // 3) Kalau tetap gagal, lempar error dengan sedikit cuplikan untuk debug
  const preview = raw.slice(0, Math.min(300, raw.length))
  throw new Error(
    `Could not extract JSON from AI response. Preview: ${preview}`,
  )
}

// ===== Helper: normalisasi struktur minimal agar validator lewat =====
function coerceToModuleContent(obj: any): ModuleContent {
  const safeArray = (v: any) => (Array.isArray(v) ? v : [])
  const ensureString = (v: any) => (typeof v === 'string' ? v : '')

  const out: ModuleContent = {
    content_easy: ensureString(obj?.content_easy),
    content_medium: ensureString(obj?.content_medium),
    content_high: ensureString(obj?.content_high),
    questions: {
      easy: {
        mcq: safeArray(obj?.questions?.easy?.mcq),
        short: safeArray(obj?.questions?.easy?.short),
      },
      medium: {
        mcq: safeArray(obj?.questions?.medium?.mcq),
        short: safeArray(obj?.questions?.medium?.short),
      },
      high: {
        mcq: safeArray(obj?.questions?.high?.mcq),
        short: safeArray(obj?.questions?.high?.short),
      },
    },
  }
  return out
}

// ===== Validator tetap (diperketat tapi informatif) =====
function validateModuleContent(content: ModuleContent): void {
  const mustStr = (v: any, name: string) => {
    if (!v || typeof v !== 'string')
      throw new Error(`Invalid ${name} in AI response`)
  }
  mustStr(content.content_easy, 'content_easy')
  mustStr(content.content_medium, 'content_medium')
  mustStr(content.content_high, 'content_high')

  const levels: Array<keyof ModuleContent['questions']> = [
    'easy',
    'medium',
    'high',
  ]
  for (const level of levels) {
    const q = content.questions[level]
    if (!q || typeof q !== 'object')
      throw new Error(`Invalid questions.${level}`)
    if (!Array.isArray(q.mcq)) throw new Error(`Invalid questions.${level}.mcq`)
    if (!Array.isArray(q.short))
      throw new Error(`Invalid questions.${level}.short`)
    // Opsional: minimal 5 butir (jika kamu mau strict, aktifkan baris di bawah)
    // if (q.mcq.length < 5 || q.short.length < 5) {
    //   throw new Error(`Not enough questions for ${level}. Need >=5 MCQ and >=5 Short.`)
    // }
  }
}

// ===== Fungsi utama: panggil Ollama & parse JSON =====
export const generateModuleContent = async (
  moduleText: string,
  moduleTitle: string,
): Promise<ModuleContent> => {
  const apiUrl = process.env.OLLAMA_API_URL || DEFAULT_API_URL
  const model = process.env.OLLAMA_MODEL || DEFAULT_MODEL

  // Prompt yang memaksa JSON-only
  const prompt = `
You are to produce ONLY a JSON object, no markdown fences, no explanations, no "thinking".
Given a learning module titled "${moduleTitle}", with content (truncated):
"${moduleText.substring(0, 2000)}..."

Return a single JSON with this exact shape:

{
  "content_easy": "...",
  "content_medium": "...",
  "content_high": "...",
  "questions": {
    "easy": {
      "mcq": [
        { "question": "...", "options": ["...", "...", "...", "..."], "answer": "...", "explanation": "..." }
      ],
      "short": [
        { "question": "...", "answer": "...", "explanation": "..." }
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

Rules:
- Easy = basic, Medium = intermediate, High = applied/advanced.
- Output MUST be valid JSON. Do NOT include backticks or markdown fences.
- Do NOT include any keys other than those specified.
  `.trim()

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        // Memaksa JSON (didukung banyak model di Ollama; abaikan jika tidak didukung)
        format: 'json',
        options: { temperature: 0.7 },
      }),
    })

    if (!res.ok) {
      throw new Error(`Ollama API error: ${res.status} ${res.statusText}`)
    }

    const data: OllamaGenerateResponse = await res.json()
    const raw = data.response || data.text || ''
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
    console.error('Error calling/parsing Ollama:', err)
    throw new Error('Invalid JSON response from AI model')
  }
}

// ===== Feedback jawaban siswa: tetap, hanya rapikan sedikit =====
export const getFeedbackForAnswer = async (
  question: string,
  correctAnswer: string,
  studentAnswer: string,
): Promise<string> => {
  const apiUrl = process.env.OLLAMA_API_URL || DEFAULT_API_URL
  const model = process.env.OLLAMA_MODEL || 'tinyllama'
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
        stream: false,
        options: { temperature: 0.3 },
      }),
    })
    if (!res.ok)
      throw new Error(`Ollama API error: ${res.status} ${res.statusText}`)
    const data: OllamaGenerateResponse = await res.json()
    return (
      data.response || data.text || 'AI feedback is not available at this time.'
    )
  } catch (e) {
    console.error('Error getting feedback from Ollama:', e)
    return 'AI feedback is not available at this time.'
  }
}
