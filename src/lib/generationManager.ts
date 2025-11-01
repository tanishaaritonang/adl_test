import {
  generateEasyContent,
  generateMediumContent,
  generateHardContent,
  ModuleContent,
  Question,
} from './ai'
import {
  ContentManager,
  DifficultyLevel,
  GenerationStatus,
} from './contentManager'

export interface GenerationProgress {
  moduleId: string
  difficulty: DifficultyLevel
  status: GenerationStatus
  error?: string
}

export class GenerationManager {
  private contentManager: ContentManager
  private onProgress?: (progress: GenerationProgress) => void

  constructor(onProgress?: (progress: GenerationProgress) => void) {
    this.contentManager = new ContentManager()
    this.onProgress = onProgress
  }

  /**
   * Mengatur callback untuk melacak kemajuan pembuatan konten
   */
  setProgressCallback(callback: (progress: GenerationProgress) => void) {
    this.onProgress = callback
  }

  /**
   * Menghasilkan konten untuk satu tingkat kesulitan dalam satu modul
   */
  async generateModuleDifficulty(
    moduleId: string,
    difficulty: DifficultyLevel,
    moduleText: string,
    moduleTitle: string,
    onStream?: (chunk: string) => void,
  ): Promise<Partial<ModuleContent>> {
    try {
      // Update status ke generating
      this.contentManager.updateStatus(moduleId, difficulty, 'generating')
      this.onProgress?.({
        moduleId,
        difficulty,
        status: 'generating',
      })

      let result: Partial<ModuleContent> = {}

      // Generate konten berdasarkan tingkat kesulitan
      switch (difficulty) {
        case 'easy':
          result = await generateEasyContent(moduleText, moduleTitle, onStream)
          break
        case 'medium':
          result = await generateMediumContent(
            moduleText,
            moduleTitle,
            onStream,
          )
          break
        case 'high':
          result = await generateHardContent(moduleText, moduleTitle, onStream)
          break
        default:
          throw new Error(`Unknown difficulty level: ${difficulty}`)
      }

      console.log(
        `[DEBUG] Processing result for ${difficulty} difficulty:`,
        result,
      )

      // Perbarui konten ke content manager
      if (result.content_easy) {
        console.log(
          `[DEBUG] Updating easy content in content manager:`,
          result.content_easy.substring(0, 50) + '...',
        )
        this.contentManager.updateContent(
          moduleId,
          'easy',
          result.content_easy,
          result.questions?.easy,
        )
      }

      if (result.content_medium) {
        console.log(
          `[DEBUG] Updating medium content in content manager:`,
          result.content_medium.substring(0, 50) + '...',
        )
        this.contentManager.updateContent(
          moduleId,
          'medium',
          result.content_medium,
          result.questions?.medium,
        )
      }

      if (result.content_high) {
        console.log(
          `[DEBUG] Updating hard content in content manager:`,
          result.content_high.substring(0, 50) + '...',
        )
        this.contentManager.updateContent(
          moduleId,
          'high',
          result.content_high,
          result.questions?.high,
        )
      }

      // Update status ke completed
      this.contentManager.updateStatus(moduleId, difficulty, 'completed')
      this.onProgress?.({
        moduleId,
        difficulty,
        status: 'completed',
      })

      const returnResult = {
        content_easy: this.contentManager.getContent(moduleId, 'easy'),
        content_medium: this.contentManager.getContent(moduleId, 'medium'),
        content_high: this.contentManager.getContent(moduleId, 'high'),
        questions: {
          easy: this.contentManager.getQuestions(moduleId, 'easy') || {
            mcq: [],
            short: [],
          },
          medium: this.contentManager.getQuestions(moduleId, 'medium') || {
            mcq: [],
            short: [],
          },
          high: this.contentManager.getQuestions(moduleId, 'high') || {
            mcq: [],
            short: [],
          },
        },
      } as ModuleContent

      // Create a result that only contains data for the specific difficulty that was requested
      const specificResult: Partial<ModuleContent> = {}

      if (difficulty === 'easy') {
        specificResult.content_easy = this.contentManager.getContent(
          moduleId,
          'easy',
        )
        specificResult.questions = {
          easy: this.contentManager.getQuestions(moduleId, 'easy') || {
            mcq: [],
            short: [],
          },
        }
      } else if (difficulty === 'medium') {
        specificResult.content_medium = this.contentManager.getContent(
          moduleId,
          'medium',
        )
        specificResult.questions = {
          medium: this.contentManager.getQuestions(moduleId, 'medium') || {
            mcq: [],
            short: [],
          },
        }
      } else if (difficulty === 'high') {
        specificResult.content_high = this.contentManager.getContent(
          moduleId,
          'high',
        )
        specificResult.questions = {
          high: this.contentManager.getQuestions(moduleId, 'high') || {
            mcq: [],
            short: [],
          },
        }
      }

      console.log(
        `[DEBUG] Returning specific result for ${difficulty} from generateModuleDifficulty:`,
        {
          hasContent: !!specificResult[`content_${difficulty}`],
          hasQuestions: !!specificResult.questions?.[difficulty],
          contentPreview:
            specificResult[`content_${difficulty}`]?.substring(0, 50) + '...',
        },
      )

      return specificResult as ModuleContent
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'

      // Update status ke error
      this.contentManager.updateStatus(
        moduleId,
        difficulty,
        'error',
        errorMessage,
      )
      this.onProgress?.({
        moduleId,
        difficulty,
        status: 'error',
        error: errorMessage,
      })

      throw error
    }
  }

  /**
   * Menghasilkan semua tingkat kesulitan untuk satu modul secara terpisah (serial)
   */
  async generateModuleContentSerial(
    moduleId: string,
    moduleText: string,
    moduleTitle: string,
    onStream?: (chunk: string) => void,
  ): Promise<ModuleContent> {
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'high']
    const result: Partial<ModuleContent> = {
      questions: {},
    }

    for (const difficulty of difficulties) {
      try {
        const partialResult = await this.generateModuleDifficulty(
          moduleId,
          difficulty,
          moduleText,
          moduleTitle,
          onStream,
        )

        // Gabungkan hasil
        if (partialResult.content_easy)
          result.content_easy = partialResult.content_easy
        if (partialResult.content_medium)
          result.content_medium = partialResult.content_medium
        if (partialResult.content_high)
          result.content_high = partialResult.content_high

        if (partialResult.questions?.easy)
          result.questions!.easy = partialResult.questions.easy
        if (partialResult.questions?.medium)
          result.questions!.medium = partialResult.questions.medium
        if (partialResult.questions?.high)
          result.questions!.high = partialResult.questions.high
      } catch (error) {
        console.error(
          `Error generating ${difficulty} content for module ${moduleId}:`,
          error,
        )
        throw error // Re-throw to stop the serial process
      }
    }

    return result as ModuleContent
  }

  /**
   * Menghasilkan semua tingkat kesulitan untuk satu modul secara terpisah (paralel)
   */
  async generateModuleContentParallel(
    moduleId: string,
    moduleText: string,
    moduleTitle: string,
    onStream?: (chunk: string) => void,
  ): Promise<ModuleContent> {
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'high']

    // Jalankan ketiga tingkat kesulitan secara paralel
    const results = await Promise.allSettled(
      difficulties.map((difficulty) =>
        this.generateModuleDifficulty(
          moduleId,
          difficulty,
          moduleText,
          moduleTitle,
          onStream,
        ),
      ),
    )

    const result: Partial<ModuleContent> = {
      questions: {},
    }

    // Proses hasil dari setiap tingkat kesulitan
    for (let i = 0; i < results.length; i++) {
      const difficulty = difficulties[i]
      const res = results[i]

      if (res.status === 'fulfilled') {
        const partialResult = res.value

        switch (difficulty) {
          case 'easy':
            if (partialResult.content_easy)
              result.content_easy = partialResult.content_easy
            if (partialResult.questions?.easy)
              result.questions!.easy = partialResult.questions.easy
            break
          case 'medium':
            if (partialResult.content_medium)
              result.content_medium = partialResult.content_medium
            if (partialResult.questions?.medium)
              result.questions!.medium = partialResult.questions.medium
            break
          case 'high':
            if (partialResult.content_high)
              result.content_high = partialResult.content_high
            if (partialResult.questions?.high)
              result.questions!.high = partialResult.questions.high
            break
        }
      } else {
        console.error(
          `Error generating ${difficulty} content for module ${moduleId}:`,
          res.reason,
        )
        // Tidak melempar error karena ini adalah eksekusi paralel
      }
    }

    // Cek apakah semua berhasil
    const errors = results.filter((res) => res.status === 'rejected')
    if (errors.length > 0) {
      throw new Error(
        `Some difficulties failed to generate: ${errors
          .map((_, index) => difficulties[index])
          .join(', ')}`,
      )
    }

    return result as ModuleContent
  }

  /**
   * Mendapatkan status konten untuk modul dan tingkat kesulitan tertentu
   */
  getStatus(moduleId: string, difficulty: DifficultyLevel): GenerationStatus {
    return this.contentManager.getStatus(moduleId, difficulty)
  }

  /**
   * Mendapatkan semua status untuk modul tertentu
   */
  getModuleStatus(moduleId: string): Record<DifficultyLevel, GenerationStatus> {
    return this.contentManager.getModuleStatus(moduleId)
  }

  /**
   * Mendapatkan konten untuk modul dan tingkat kesulitan tertentu
   */
  getContent(
    moduleId: string,
    difficulty: DifficultyLevel,
  ): string | undefined {
    return this.contentManager.getContent(moduleId, difficulty)
  }

  /**
   * Mendapatkan soal untuk modul dan tingkat kesulitan tertentu
   */
  getQuestions(
    moduleId: string,
    difficulty: DifficultyLevel,
  ): { mcq: Question[]; short: Question[] } | undefined {
    return this.contentManager.getQuestions(moduleId, difficulty)
  }

  /**
   * Mendapatkan konten lengkap untuk modul jika semua tingkat kesulitan telah selesai
   */
  getCompleteModuleContent(moduleId: string): Partial<ModuleContent> | null {
    return this.contentManager.getCompleteModuleContent(moduleId)
  }

  /**
   * Menginisialisasi status untuk modul dan tingkat kesulitan tertentu
   */
  initializeModuleDifficulty(moduleId: string, difficulty: DifficultyLevel) {
    this.contentManager.initializeModuleDifficulty(moduleId, difficulty)
  }
}
