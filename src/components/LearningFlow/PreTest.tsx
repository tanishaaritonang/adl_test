'use client'

import { useState } from 'react'

type Question = {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
}

type PreTestProps = {
  questions: Question[]
  moduleId: string
  onComplete: (answers: (number | null)[], score: number) => void
}

export default function PreTest({
  questions,
  moduleId,
  onComplete,
}: PreTestProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null),
  )
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = optionIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowExplanation(false)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowExplanation(false)
    }
  }

  const handleShowExplanation = () => {
    setShowExplanation(true)
  }

  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0
    answers.forEach((answer, index) => {
      if (answer !== null && answer === questions[index].correctAnswer) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / questions.length) * 100)
    onComplete(answers, score)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswered = answers[currentQuestionIndex] !== null

  return (
    <div className="rounded-lg bg-slate-800 p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">
          Pre-Test: Question {currentQuestionIndex + 1}/{questions.length}
        </h2>
        <div className="mb-4 h-2 w-full rounded-full bg-slate-700">
          <div
            className="h-2 rounded-full bg-green-600"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / questions.length) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-4 text-lg font-medium">{currentQuestion.text}</h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                answers[currentQuestionIndex] === index
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onClick={() => handleAnswerSelect(index)}
            >
              <div className="flex items-center">
                <div
                  className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full border ${
                    answers[currentQuestionIndex] === index
                      ? 'border-green-500 bg-green-500'
                      : 'border-slate-500'
                  }`}
                >
                  {answers[currentQuestionIndex] === index && (
                    <div className="h-3 w-3 rounded-full bg-white"></div>
                  )}
                </div>
                <span>{option}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showExplanation && (
        <div className="mb-6 rounded-lg border border-slate-600 bg-slate-700/50 p-4">
          <h4 className="mb-2 font-medium">Explanation:</h4>
          <p>{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className={`rounded px-4 py-2 ${
            currentQuestionIndex === 0
              ? 'cursor-not-allowed bg-slate-700 text-slate-500'
              : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
        >
          Previous
        </button>

        <div className="flex space-x-2">
          {!showExplanation && (
            <button
              onClick={handleShowExplanation}
              disabled={!isAnswered}
              className={`rounded px-4 py-2 ${
                !isAnswered
                  ? 'cursor-not-allowed bg-slate-700 text-slate-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Show Explanation
            </button>
          )}

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`rounded px-4 py-2 ${
                !isAnswered
                  ? 'cursor-not-allowed bg-slate-700 text-slate-500'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={answers.some((a) => a === null)}
              className={`rounded px-4 py-2 ${
                answers.some((a) => a === null)
                  ? 'cursor-not-allowed bg-slate-700 text-slate-500'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Submit Pre-Test
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
