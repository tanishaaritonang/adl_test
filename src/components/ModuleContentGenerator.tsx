'use client'

import React, { useState } from 'react'
import {
  generateEasyContent,
  generateMediumContent,
  generateHardContent,
  ModuleContent,
  Question,
} from '../lib/ai'
import { GenerationManager } from '../lib/generationManager'

interface ModuleContentGeneratorProps {
  moduleId: string
  moduleText: string
  moduleTitle: string
  onContentGenerated?: (
    difficulty: 'easy' | 'medium' | 'high',
    content: Partial<ModuleContent>,
  ) => void
}

const ModuleContentGenerator: React.FC<ModuleContentGeneratorProps> = ({
  moduleId,
  moduleText,
  moduleTitle,
  onContentGenerated,
}) => {
  const [generating, setGenerating] = useState<
    'easy' | 'medium' | 'hard' | null
  >(null)
  const [progress, setProgress] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const generationManager = new GenerationManager()

  const handleGenerateEasy = async () => {
    setGenerating('easy')
    setError(null)
    setProgress('Starting to generate easy content...')

    try {
      console.log(`[DEBUG] Starting easy generation for module: ${moduleId}`)
      const result = await generationManager.generateModuleDifficulty(
        moduleId,
        'easy',
        moduleText,
        moduleTitle,
        (chunk) => {
          // Stream output to console for terminal visibility
          console.log(`[EASY] ${chunk}`)
          setProgress((prev) => prev + chunk)
        },
      )

      console.log(`[DEBUG] Easy generation result:`, result)
      if (onContentGenerated) {
        onContentGenerated('easy', result)
      }
      setProgress('Easy content generation completed!')
    } catch (err) {
      console.error('Error generating easy content:', err)
      setError(
        `Failed to generate easy content: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      )
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerateMedium = async () => {
    setGenerating('medium')
    setError(null)
    setProgress('Starting to generate medium content...')

    try {
      console.log(`[DEBUG] Starting medium generation for module: ${moduleId}`)
      const result = await generationManager.generateModuleDifficulty(
        moduleId,
        'medium',
        moduleText,
        moduleTitle,
        (chunk) => {
          // Stream output to console for terminal visibility
          console.log(`[MEDIUM] ${chunk}`)
          setProgress((prev) => prev + chunk)
        },
      )

      console.log(`[DEBUG] Medium generation result:`, result)
      if (onContentGenerated) {
        onContentGenerated('medium', result)
      }
      setProgress('Medium content generation completed!')
    } catch (err) {
      console.error('Error generating medium content:', err)
      setError(
        `Failed to generate medium content: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      )
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerateHard = async () => {
    setGenerating('hard')
    setError(null)
    setProgress('Starting to generate hard content...')

    try {
      console.log(`[DEBUG] Starting hard generation for module: ${moduleId}`)
      const result = await generationManager.generateModuleDifficulty(
        moduleId,
        'high',
        moduleText,
        moduleTitle,
        (chunk) => {
          // Stream output to console for terminal visibility
          console.log(`[HARD] ${chunk}`)
          setProgress((prev) => prev + chunk)
        },
      )

      console.log(`[DEBUG] Hard generation result:`, result)
      if (onContentGenerated) {
        onContentGenerated('high', result)
      }
      setProgress('Hard content generation completed!')
    } catch (err) {
      console.error('Error generating hard content:', err)
      setError(
        `Failed to generate hard content: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      )
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="module-content-generator rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Generate Module Content</h3>
      <p className="mb-4 text-sm text-gray-600">Module: {moduleTitle}</p>

      <div className="mb-4 flex flex-wrap gap-3">
        <button
          onClick={handleGenerateEasy}
          disabled={generating !== null}
          className={`rounded-md px-4 py-2 font-medium ${
            generating === 'easy'
              ? 'cursor-not-allowed bg-blue-400'
              : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors`}
        >
          {generating === 'easy'
            ? 'Generating Easy...'
            : 'Generate Easy Content'}
        </button>

        <button
          onClick={handleGenerateMedium}
          disabled={generating !== null}
          className={`rounded-md px-4 py-2 font-medium ${
            generating === 'medium'
              ? 'cursor-not-allowed bg-blue-400'
              : 'bg-yellow-500 hover:bg-yellow-600'
          } text-white transition-colors`}
        >
          {generating === 'medium'
            ? 'Generating Medium...'
            : 'Generate Medium Content'}
        </button>

        <button
          onClick={handleGenerateHard}
          disabled={generating !== null}
          className={`rounded-md px-4 py-2 font-medium ${
            generating === 'hard'
              ? 'cursor-not-allowed bg-blue-400'
              : 'bg-red-500 hover:bg-red-600'
          } text-white transition-colors`}
        >
          {generating === 'hard'
            ? 'Generating Hard...'
            : 'Generate Hard Content'}
        </button>
      </div>

      {generating && (
        <div className="mb-4 rounded-md bg-blue-50 p-3">
          <p className="text-sm font-medium text-blue-800">
            Status: {generating.charAt(0).toUpperCase() + generating.slice(1)}{' '}
            content generation in progress...
          </p>
        </div>
      )}

      {progress && (
        <div className="mb-4 max-h-40 overflow-y-auto rounded-md bg-gray-50 p-3">
          <h4 className="mb-1 text-sm font-medium">Generation Progress:</h4>
          <p className="whitespace-pre-wrap text-xs text-gray-700">
            {progress}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">Error: {error}</p>
        </div>
      )}
    </div>
  )
}

export default ModuleContentGenerator
