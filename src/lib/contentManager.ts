import { ModuleContent, Question } from './ai'

export type DifficultyLevel = 'easy' | 'medium' | 'high'
export type GenerationStatus = 'pending' | 'generating' | 'completed' | 'error'

export interface ModuleDifficultyState {
  content?: string
  questions?: {
    mcq: Question[]
    short: Question[]
  }
  status: GenerationStatus
  error?: string
}

export interface ModuleState {
  [difficulty: string]: ModuleDifficultyState
}

export interface AllModulesState {
  [moduleId: string]: ModuleState
}

/**
 * Content Manager untuk mengelola pembuatan konten per modul dan per tingkat kesulitan
 */
export class ContentManager {
  private state: AllModulesState = {}

  /**
   * Inisialisasi status untuk modul dan tingkat kesulitan tertentu
   */
  initializeModuleDifficulty(moduleId: string, difficulty: DifficultyLevel) {
    if (!this.state[moduleId]) {
      this.state[moduleId] = {}
    }

    if (!this.state[moduleId][difficulty]) {
      this.state[moduleId][difficulty] = {
        status: 'pending',
      }
    }
  }

  /**
   * Memperbarui status pembuatan konten untuk modul dan tingkat kesulitan tertentu
   */
  updateStatus(
    moduleId: string,
    difficulty: DifficultyLevel,
    status: GenerationStatus,
    error?: string,
  ) {
    this.initializeModuleDifficulty(moduleId, difficulty)

    this.state[moduleId][difficulty].status = status
    if (error) {
      this.state[moduleId][difficulty].error = error
    } else {
      delete this.state[moduleId][difficulty].error
    }
  }

  /**
   * Memperbarui konten untuk modul dan tingkat kesulitan tertentu
   */
  updateContent(
    moduleId: string,
    difficulty: DifficultyLevel,
    content: string,
    questions?: { mcq: Question[]; short: Question[] },
  ) {
    this.initializeModuleDifficulty(moduleId, difficulty)

    this.state[moduleId][difficulty].content = content
    if (questions) {
      this.state[moduleId][difficulty].questions = questions
    }
  }

  /**
   * Mendapatkan status untuk modul dan tingkat kesulitan tertentu
   */
  getStatus(moduleId: string, difficulty: DifficultyLevel): GenerationStatus {
    if (!this.state[moduleId] || !this.state[moduleId][difficulty]) {
      return 'pending'
    }
    return this.state[moduleId][difficulty].status
  }

  /**
   * Mendapatkan error untuk modul dan tingkat kesulitan tertentu
   */
  getError(moduleId: string, difficulty: DifficultyLevel): string | undefined {
    if (!this.state[moduleId] || !this.state[moduleId][difficulty]) {
      return undefined
    }
    return this.state[moduleId][difficulty].error
  }

  /**
   * Mendapatkan konten untuk modul dan tingkat kesulitan tertentu
   */
  getContent(
    moduleId: string,
    difficulty: DifficultyLevel,
  ): string | undefined {
    if (!this.state[moduleId] || !this.state[moduleId][difficulty]) {
      return undefined
    }
    return this.state[moduleId][difficulty].content
  }

  /**
   * Mendapatkan soal untuk modul dan tingkat kesulitan tertentu
   */
  getQuestions(
    moduleId: string,
    difficulty: DifficultyLevel,
  ): { mcq: Question[]; short: Question[] } | undefined {
    if (!this.state[moduleId] || !this.state[moduleId][difficulty]) {
      return undefined
    }
    return this.state[moduleId][difficulty].questions
  }

  /**
   * Memeriksa apakah semua tingkat kesulitan untuk modul tertentu telah selesai
   */
  isModuleComplete(moduleId: string): boolean {
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'high']

    for (const difficulty of difficulties) {
      const status = this.getStatus(moduleId, difficulty)
      if (status !== 'completed') {
        return false
      }
    }
    return true
  }

  /**
   * Menggabungkan konten dari semua tingkat kesulitan untuk modul tertentu menjadi ModuleContent
   */
  getCompleteModuleContent(moduleId: string): Partial<ModuleContent> | null {
    if (!this.isModuleComplete(moduleId)) {
      return null
    }

    const result: Partial<ModuleContent> = {
      questions: {},
    }

    const easyContent = this.getContent(moduleId, 'easy')
    const mediumContent = this.getContent(moduleId, 'medium')
    const hardContent = this.getContent(moduleId, 'high')

    if (easyContent) result.content_easy = easyContent
    if (mediumContent) result.content_medium = mediumContent
    if (hardContent) result.content_high = hardContent

    const easyQuestions = this.getQuestions(moduleId, 'easy')
    const mediumQuestions = this.getQuestions(moduleId, 'medium')
    const hardQuestions = this.getQuestions(moduleId, 'high')

    if (easyQuestions) result.questions!.easy = easyQuestions
    if (mediumQuestions) result.questions!.medium = mediumQuestions
    if (hardQuestions) result.questions!.high = hardQuestions

    return result
  }

  /**
   * Mendapatkan semua status untuk modul tertentu
   */
  getModuleStatus(moduleId: string): Record<DifficultyLevel, GenerationStatus> {
    const result: Record<DifficultyLevel, GenerationStatus> = {
      easy: 'pending',
      medium: 'pending',
      high: 'pending',
    }

    for (const difficulty of ['easy', 'medium', 'high'] as DifficultyLevel[]) {
      result[difficulty] = this.getStatus(moduleId, difficulty)
    }

    return result
  }
}
