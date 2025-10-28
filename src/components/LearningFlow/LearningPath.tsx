'use client'

import { useState } from 'react'

type LearningItem = {
  id: string
  title: string
  content: string
  question?: Question
}

type Question = {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
}

type LearningPathProps = {
  items: LearningItem[]
  moduleId: string
  level: 'easy' | 'medium' | 'hard'
  onComplete: () => void
}

export default function LearningPath({
  items,
  moduleId,
  level,
  onComplete,
}: LearningPathProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showQuestion, setShowQuestion] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const currentItem = items[currentIndex]
  const hasQuestion = currentItem.question !== undefined

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowQuestion(false)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      // Learning path complete
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowQuestion(false)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswer(optionIndex)
  }

  const handleCheckAnswer = () => {
    if (selectedAnswer !== null && currentItem.question) {
      setShowExplanation(true)
    }
  }

  const isCorrect =
    currentItem.question &&
    selectedAnswer === currentItem.question.correctAnswer

  return (
    <div className="rounded-lg bg-slate-800 p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">
          Learning Path: {currentItem.title}
        </h2>
        <div className="mb-4 h-2 w-full rounded-full bg-slate-700">
          <div
            className="h-2 rounded-full bg-green-600"
            style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-400">
          Level: <span className="capitalize">{level}</span>
        </p>
      </div>

      <div className="mb-6">
        <div
          className="prose prose-invert mb-6 max-w-none"
          dangerouslySetInnerHTML={{
            __html: currentItem.content.replace(/\n/g, '<br />'),
          }}
        />

        {hasQuestion && !showQuestion && (
          <button
            onClick={() => setShowQuestion(true)}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Practice Question
          </button>
        )}

        {hasQuestion && showQuestion && currentItem.question && (
          <div className="mt-6 rounded-lg border border-slate-600 bg-slate-700/50 p-4">
            <h3 className="mb-4 text-lg font-medium">
              {currentItem.question.text}
            </h3>

            <div className="mb-4 space-y-3">
              {currentItem.question.options.map((option, index) => (
                <div
                  key={index}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedAnswer === index
                      ? isCorrect
                        ? 'border-green-500 bg-green-900/20'
                        : 'border-red-500 bg-red-900/20'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-center">
                    <div
                      className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full border ${
                        selectedAnswer === index
                          ? isCorrect
                            ? 'border-green-500 bg-green-500'
                            : 'border-red-500 bg-red-500'
                          : 'border-slate-500'
                      }`}
                    >
                      {selectedAnswer === index && (
                        <div className="h-3 w-3 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedAnswer !== null && !showExplanation && (
              <button
                onClick={handleCheckAnswer}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Check Answer
              </button>
            )}

            {showExplanation && currentItem.question && (
              <div
                className="${ isCorrect ? 'border-green-500 bg-green-900/20'
                : 'border-red-500 bg-red-900/20' } mt-4 rounded-lg border
              p-4"
              >
                <h4 className="mb-2 font-medium">
                  {isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
                </h4>
                <p>{currentItem.question.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`rounded px-4 py-2 ${
            currentIndex === 0
              ? 'cursor-not-allowed bg-slate-700 text-slate-500'
              : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          {currentIndex < items.length - 1
            ? 'Next Topic'
            : 'Complete Learning Path'}
        </button>
      </div>
    </div>
  )
}
