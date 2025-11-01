import { ModuleContent, Question } from './ai'

/**
 * Validasi konten untuk satu tingkat kesulitan
 */
export function validateDifficultyContent(
  content: string | undefined,
  questions: { mcq: Question[]; short: Question[] } | undefined,
  difficulty: string,
): void {
  if (content !== undefined) {
    if (!content || typeof content !== 'string') {
      throw new Error(`Invalid content for ${difficulty} difficulty`)
    }

    // Basic validation to ensure content isn't too short
    if (content.trim().length < 20) {
      throw new Error(`Content for ${difficulty} difficulty is too short`)
    }
  }

  if (questions !== undefined) {
    if (!Array.isArray(questions.mcq)) {
      throw new Error(`Invalid MCQ questions for ${difficulty} difficulty`)
    }

    if (!Array.isArray(questions.short)) {
      throw new Error(
        `Invalid short answer questions for ${difficulty} difficulty`,
      )
    }

    // Validate each MCQ question
    for (const question of questions.mcq) {
      validateQuestion(question, `${difficulty} MCQ`)
    }

    // Validate each short answer question
    for (const question of questions.short) {
      validateQuestion(question, `${difficulty} short answer`)
    }
  }
}

/**
 * Validasi struktur pertanyaan
 */
export function validateQuestion(question: Question, context: string): void {
  if (!question || typeof question !== 'object') {
    throw new Error(`Invalid question structure in ${context}`)
  }

  if (!question.question || typeof question.question !== 'string') {
    throw new Error(`Invalid question text in ${context}`)
  }

  if (question.options) {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new Error(
        `Invalid options in ${context} - must have at least 2 options`,
      )
    }
  }

  if (!question.answer || typeof question.answer !== 'string') {
    throw new Error(`Invalid answer in ${context}`)
  }

  if (!question.explanation || typeof question.explanation !== 'string') {
    throw new Error(`Invalid explanation in ${context}`)
  }

  // Basic validation to ensure explanation isn't too short
  if (question.explanation.trim().length < 5) {
    throw new Error(`Explanation in ${context} is too short`)
  }
}

/**
 * Validasi konten modul lengkap
 */
export function validateCompleteModuleContent(content: ModuleContent): void {
  // Validasi konten tingkat kesulitan
  if (content.content_easy !== undefined) {
    validateDifficultyContent(
      content.content_easy,
      content.questions?.easy,
      'easy',
    )
  }

  if (content.content_medium !== undefined) {
    validateDifficultyContent(
      content.content_medium,
      content.questions?.medium,
      'medium',
    )
  }

  if (content.content_high !== undefined) {
    validateDifficultyContent(
      content.content_high,
      content.questions?.high,
      'high',
    )
  }

  // Pastikan questions selalu memiliki struktur yang benar
  if (!content.questions || typeof content.questions !== 'object') {
    throw new Error('Invalid questions structure in module content')
  }
}

/**
 * Gabungkan hasil dari berbagai tingkat kesulitan menjadi satu objek ModuleContent
 */
export function mergeModuleContent(
  parts: Partial<ModuleContent>[],
): ModuleContent {
  const result: ModuleContent = {
    content_easy: '',
    content_medium: '',
    content_high: '',
    questions: {
      easy: { mcq: [], short: [] },
      medium: { mcq: [], short: [] },
      high: { mcq: [], short: [] },
    },
  }

  for (const part of parts) {
    if (part.content_easy) result.content_easy = part.content_easy
    if (part.content_medium) result.content_medium = part.content_medium
    if (part.content_high) result.content_high = part.content_high

    if (part.questions?.easy) result.questions.easy = part.questions.easy
    if (part.questions?.medium) result.questions.medium = part.questions.medium
    if (part.questions?.high) result.questions.high = part.questions.high
  }

  return result
}

/**
 * Tipe untuk pelaporan kemajuan
 */
export interface ProgressReport {
  moduleId: string
  difficulty: 'easy' | 'medium' | 'high'
  status: 'pending' | 'generating' | 'completed' | 'error'
  progress: number // 0-100
  error?: string
}

/**
 * Fungsi untuk membuat progress report
 */
export function createProgressReport(
  moduleId: string,
  difficulty: 'easy' | 'medium' | 'high',
  status: 'pending' | 'generating' | 'completed' | 'error',
  progress: number,
  error?: string,
): ProgressReport {
  return {
    moduleId,
    difficulty,
    status,
    progress,
    error,
  }
}
