'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import PreTest from '@/components/LearningFlow/PreTest'
import LearningPath from '@/components/LearningFlow/LearningPath'
import PostTest from '@/components/LearningFlow/PostTest'
import FeedbackSummary from '@/components/LearningFlow/FeedbackSummary'

// Define types for our learning flow
type Question = {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
}

type LearningItem = {
  id: string
  title: string
  content: string
  question?: Question
}

type Attempt = {
  moduleId: string
  preTestScore: number
  postTestScore: number
  level: 'easy' | 'medium' | 'hard'
  completed: boolean
}

type Placement = {
  userId: string
  moduleId: string
  level: 'easy' | 'medium' | 'hard'
}

const moduleTitles: Record<string, string> = {
  'osi-model': 'OSI Model',
  subnetting: 'Subnetting',
  routing: 'Routing',
  switching: 'Switching',
  protocols: 'Network Protocols',
  security: 'Network Security',
}

export default function ModulePage() {
  const { moduleId } = useParams()
  const { user, userProfile, isLoading, signOut } = useUser()

  // Learning flow states
  const [currentStep, setCurrentStep] = useState<
    'pre-test' | 'learning' | 'post-test' | 'feedback'
  >('pre-test')
  const [preTestQuestions, setPreTestQuestions] = useState<Question[]>([])
  const [preTestAnswers, setPreTestAnswers] = useState<(number | null)[]>([])
  const [preTestScore, setPreTestScore] = useState<number | null>(null)
  const [placementLevel, setPlacementLevel] = useState<
    'easy' | 'medium' | 'hard'
  >('medium')
  const [learningItems, setLearningItems] = useState<LearningItem[]>([])
  const [postTestQuestions, setPostTestQuestions] = useState<Question[]>([])
  const [postTestAnswers, setPostTestAnswers] = useState<(number | null)[]>([])
  const [postTestScore, setPostTestScore] = useState<number | null>(null)

  // Load module data from API
  useEffect(() => {
    if (!moduleId || typeof moduleId !== 'string') return

    const loadModuleData = async () => {
      try {
        // Fetch pre-test questions from AI
        const preTestResponse = await fetch('/api/ai/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: moduleTitles[moduleId as string] || moduleId,
            level: 'medium', // Default level, will be updated after pre-test
            numQuestions: 30,
          }),
        })

        if (preTestResponse.ok) {
          const questions = await preTestResponse.json()
          setPreTestQuestions(questions)
          setPreTestAnswers(Array(questions.length).fill(null))
        } else {
          console.error('Failed to fetch pre-test questions')
          // Fallback to mock data if API fails
          const mockQuestions: Question[] = Array.from(
            { length: 30 },
            (_, i) => ({
              id: `pre-q-${i}`,
              text: `Sample pre-test question ${i + 1} about ${
                moduleTitles[moduleId as string] || moduleId
              }`,
              options: [
                `Option A for question ${i + 1}`,
                `Option B for question ${i + 1}`,
                `Option C for question ${i + 1}`,
                `Option D for question ${i + 1}`,
              ],
              correctAnswer: i % 4,
              explanation: `Explanation for question ${i + 1}`,
            }),
          )
          setPreTestQuestions(mockQuestions)
          setPreTestAnswers(Array(30).fill(null))
        }
      } catch (error) {
        console.error('Error loading pre-test questions:', error)
        // Fallback to mock data if API fails
        const mockQuestions: Question[] = Array.from(
          { length: 30 },
          (_, i) => ({
            id: `pre-q-${i}`,
            text: `Sample pre-test question ${i + 1} about ${
              moduleTitles[moduleId as string] || moduleId
            }`,
            options: [
              `Option A for question ${i + 1}`,
              `Option B for question ${i + 1}`,
              `Option C for question ${i + 1}`,
              `Option D for question ${i + 1}`,
            ],
            correctAnswer: i % 4,
            explanation: `Explanation for question ${i + 1}`,
          }),
        )
        setPreTestQuestions(mockQuestions)
        setPreTestAnswers(Array(30).fill(null))
      }
    }

    loadModuleData()
  }, [moduleId])

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl p-3">
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-500"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="w-full max-w-4xl p-3">
        <div className="mt-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p>Please log in to access this learning module.</p>
        </div>
      </div>
    )
  }

  if (!moduleId || typeof moduleId !== 'string') {
    return (
      <div className="w-full max-w-4xl p-3">
        <div className="mt-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Module Not Found</h1>
          <p>The requested module does not exist.</p>
        </div>
      </div>
    )
  }

  const handlePreTestComplete = async (
    answers: (number | null)[],
    score: number,
  ) => {
    setPreTestAnswers(answers)
    setPreTestScore(score)

    // Determine placement level based on score
    let determinedLevel: 'easy' | 'medium' | 'hard'
    if (score >= 80) {
      determinedLevel = 'hard'
    } else if (score >= 60) {
      determinedLevel = 'medium'
    } else {
      determinedLevel = 'easy'
    }
    setPlacementLevel(determinedLevel)

    try {
      // Fetch learning materials from AI based on placement level
      const learningMaterialsResponse = await fetch(
        '/api/ai/generate-learning-materials',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: moduleTitles[moduleId as string] || moduleId,
            level: determinedLevel,
            numItems: 10,
          }),
        },
      )

      if (learningMaterialsResponse.ok) {
        const learningItems = await learningMaterialsResponse.json()
        setLearningItems(learningItems)
      } else {
        console.error('Failed to fetch learning materials')
        // Fallback to mock data if API fails
        const mockLearningItems: LearningItem[] = Array.from(
          { length: 10 },
          (_, i) => ({
            id: `item-${i}`,
            title: `Learning Topic ${i + 1}`,
            content: `Detailed content about this networking concept for ${
              moduleTitles[moduleId as string] || moduleId
            }. This includes key information, examples, and best practices.`,
          }),
        )
        setLearningItems(mockLearningItems)
      }

      // Also fetch post-test questions based on the determined level
      const postTestResponse = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: moduleTitles[moduleId as string] || moduleId,
          level: determinedLevel,
          numQuestions: 30,
        }),
      })

      if (postTestResponse.ok) {
        const postTestQuestions = await postTestResponse.json()
        setPostTestQuestions(postTestQuestions)
        setPostTestAnswers(Array(postTestQuestions.length).fill(null))
      } else {
        console.error('Failed to fetch post-test questions')
        // Fallback to mock data if API fails
        const mockPostTestQuestions: Question[] = Array.from(
          { length: 30 },
          (_, i) => ({
            id: `post-q-${i}`,
            text: `Sample post-test question ${i + 1} about ${
              moduleTitles[moduleId as string] || moduleId
            }`,
            options: [
              `Option A for post question ${i + 1}`,
              `Option B for post question ${i + 1}`,
              `Option C for post question ${i + 1}`,
              `Option D for post question ${i + 1}`,
            ],
            correctAnswer: i % 4,
            explanation: `Explanation for post-test question ${i + 1}`,
          }),
        )
        setPostTestQuestions(mockPostTestQuestions)
        setPostTestAnswers(Array(30).fill(null))
      }
    } catch (error) {
      console.error('Error loading learning materials or post-test:', error)
      // Fallback to mock data if API fails
      const mockLearningItems: LearningItem[] = Array.from(
        { length: 10 },
        (_, i) => ({
          id: `item-${i}`,
          title: `Learning Topic ${i + 1}`,
          content: `Detailed content about this networking concept for ${
            moduleTitles[moduleId as string] || moduleId
          }. This includes key information, examples, and best practices.`,
        }),
      )
      setLearningItems(mockLearningItems)

      const mockPostTestQuestions: Question[] = Array.from(
        { length: 30 },
        (_, i) => ({
          id: `post-q-${i}`,
          text: `Sample post-test question ${i + 1} about ${
            moduleTitles[moduleId as string] || moduleId
          }`,
          options: [
            `Option A for post question ${i + 1}`,
            `Option B for post question ${i + 1}`,
            `Option C for post question ${i + 1}`,
            `Option D for post question ${i + 1}`,
          ],
          correctAnswer: i % 4,
          explanation: `Explanation for post-test question ${i + 1}`,
        }),
      )
      setPostTestQuestions(mockPostTestQuestions)
      setPostTestAnswers(Array(30).fill(null))
    }

    setCurrentStep('learning')
  }

  const handleLearningComplete = () => {
    setCurrentStep('post-test')
  }

  const handlePostTestComplete = async (
    answers: (number | null)[],
    score: number,
  ) => {
    setPostTestAnswers(answers)
    setPostTestScore(score)

    try {
      // Fetch AI feedback
      const feedbackResponse = await fetch('/api/ai/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preTestScore: preTestScore || 0,
          postTestScore: score,
          topic: moduleTitles[moduleId as string] || moduleId,
          level: placementLevel,
          answers: answers,
        }),
      })

      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json()
        console.log('AI Feedback:', feedbackData)
        // In a real implementation, we might store this feedback for display
        // For now, just log it to console
      } else {
        console.error('Failed to fetch AI feedback')
      }
    } catch (error) {
      console.error('Error fetching AI feedback:', error)
    }

    setCurrentStep('feedback')
  }

  return (
    <div className="w-full max-w-4xl p-3">
      <div className="mt-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {moduleTitles[moduleId as string] || moduleId}
          </h1>
          <div className="text-right">
            <p className="text-slate-300">
              Welcome, {userProfile?.full_name || user.email}
            </p>
            <button
              onClick={() => signOut()}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm">
            <span
              className={
                currentStep === 'pre-test' ? 'font-bold text-green-400' : ''
              }
            >
              Pre-Test
            </span>
            <span
              className={
                currentStep === 'learning' ? 'font-bold text-green-400' : ''
              }
            >
              Learning Path
            </span>
            <span
              className={
                currentStep === 'post-test' ? 'font-bold text-green-400' : ''
              }
            >
              Post-Test
            </span>
            <span
              className={
                currentStep === 'feedback' ? 'font-bold text-green-400' : ''
              }
            >
              Feedback
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-700">
            <div
              className="h-2 rounded-full bg-green-600 transition-all duration-500"
              style={{
                width:
                  currentStep === 'pre-test'
                    ? '25%'
                    : currentStep === 'learning'
                      ? '50%'
                      : currentStep === 'post-test'
                        ? '75%'
                        : '100%',
              }}
            ></div>
          </div>
        </div>

        {currentStep === 'pre-test' && (
          <PreTest
            questions={preTestQuestions}
            onComplete={handlePreTestComplete}
            moduleId={moduleId as string}
          />
        )}

        {currentStep === 'learning' && (
          <LearningPath
            items={learningItems}
            moduleId={moduleId as string}
            level={placementLevel}
            onComplete={handleLearningComplete}
          />
        )}

        {currentStep === 'post-test' && (
          <PostTest
            questions={postTestQuestions}
            moduleId={moduleId as string}
            level={placementLevel}
            onComplete={handlePostTestComplete}
          />
        )}

        {currentStep === 'feedback' && (
          <FeedbackSummary
            preTestScore={preTestScore || 0}
            postTestScore={postTestScore || 0}
            moduleId={moduleId as string}
            level={placementLevel}
          />
        )}
      </div>
    </div>
  )
}
