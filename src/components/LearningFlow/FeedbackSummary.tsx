'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type FeedbackSummaryProps = {
  preTestScore: number
  postTestScore: number
  moduleId: string
  level: 'easy' | 'medium' | 'hard'
}

// Define module titles mapping
const moduleTitles: Record<string, string> = {
  'osi-model': 'OSI Model',
  subnetting: 'Subnetting',
  routing: 'Routing',
  switching: 'Switching',
  protocols: 'Network Protocols',
  security: 'Network Security',
}

export default function FeedbackSummary({
  preTestScore,
  postTestScore,
  moduleId,
  level,
}: FeedbackSummaryProps) {
  const [improvement, setImprovement] = useState<number>(0)
  const [feedbackMessage, setFeedbackMessage] = useState<string>('')
  const [aiFeedback, setAiFeedback] = useState<{
    summary?: string
    strengths?: string[]
    improvements?: string[]
    recommendations?: string[]
  } | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Calculate improvement
    const calculatedImprovement = postTestScore - preTestScore
    setImprovement(calculatedImprovement)

    // Generate feedback message based on performance
    if (postTestScore >= 90) {
      setFeedbackMessage(
        "Outstanding! You've mastered this topic. Consider exploring more advanced networking concepts.",
      )
    } else if (postTestScore >= 80) {
      setFeedbackMessage(
        'Excellent progress! You have a strong grasp of the material.',
      )
    } else if (postTestScore >= 70) {
      setFeedbackMessage(
        'Good job! You understand the fundamentals with room for improvement.',
      )
    } else if (postTestScore >= 60) {
      setFeedbackMessage(
        'Decent understanding. Focus on the areas where you struggled.',
      )
    } else {
      setFeedbackMessage(
        "You're still learning. Review the material and consider additional practice.",
      )
    }

    // Fetch AI feedback from API
    const fetchAiFeedback = async () => {
      try {
        const response = await fetch('/api/ai/generate-feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preTestScore,
            postTestScore,
            topic: moduleTitles[moduleId] || moduleId,
            level,
            answers: [], // Could pass actual answers if needed
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setAiFeedback(data)
        } else {
          console.error('Failed to fetch AI feedback')
          // Use fallback feedback
          setAiFeedback({
            summary:
              'Based on your performance, you have shown good understanding of the core concepts but need to focus on specific areas.',
            strengths: [
              'Basic understanding of the topic',
              'Good grasp of fundamental concepts',
            ],
            improvements: [
              'Complex scenarios need more practice',
              'Application of concepts in practical situations',
            ],
            recommendations: [
              'Review the detailed explanations for incorrect answers',
              'Practice more questions on challenging topics',
            ],
          })
        }
      } catch (error) {
        console.error('Error fetching AI feedback:', error)
        // Use fallback feedback
        setAiFeedback({
          summary:
            'Based on your performance, you have shown good understanding of the core concepts but need to focus on specific areas.',
          strengths: [
            'Basic understanding of the topic',
            'Good grasp of fundamental concepts',
          ],
          improvements: [
            'Complex scenarios need more practice',
            'Application of concepts in practical situations',
          ],
          recommendations: [
            'Review the detailed explanations for incorrect answers',
            'Practice more questions on challenging topics',
          ],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAiFeedback()
  }, [preTestScore, postTestScore, moduleId, level])

  // Determine improvement indicator
  const improvementIndicator =
    improvement > 0 ? '📈' : improvement < 0 ? '📉' : '➡️'

  return (
    <div className="rounded-lg bg-slate-800 p-6">
      <h2 className="mb-6 text-center text-2xl font-bold">
        Learning Feedback Summary
      </h2>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-slate-700/50 p-4 text-center">
          <h3 className="mb-2 text-lg font-semibold">Pre-Test Score</h3>
          <p className="text-3xl font-bold text-yellow-400">{preTestScore}%</p>
          <p className="mt-2 text-sm text-slate-400">Initial Assessment</p>
        </div>

        <div className="rounded-lg bg-slate-700/50 p-4 text-center">
          <h3 className="mb-2 text-lg font-semibold">Post-Test Score</h3>
          <p className="text-3xl font-bold text-green-400">{postTestScore}%</p>
          <p className="mt-2 text-sm text-slate-400">Final Assessment</p>
        </div>

        <div
          className={`rounded-lg p-4 text-center ${
            improvement > 0
              ? 'bg-green-900/20'
              : improvement < 0
                ? 'bg-red-900/20'
                : 'bg-slate-700/50'
          }`}
        >
          <h3 className="mb-2 text-lg font-semibold">Improvement</h3>
          <p className="text-3xl font-bold">
            {improvement > 0 ? '+' : ''}
            {improvement}%
          </p>
          <p className="mt-2 text-2xl">{improvementIndicator}</p>
          <p className="mt-2 text-sm text-slate-400">Score Change</p>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-slate-700/50 p-4">
        <h3 className="mb-3 text-xl font-semibold">Performance Analysis</h3>
        <p className="mb-4">{feedbackMessage}</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium">Level:</h4>
            <p className="inline-block rounded-full bg-slate-600 px-3 py-1 capitalize">
              {level}
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Module:</h4>
            <p>{moduleTitles[moduleId] || moduleId}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mb-8 rounded-lg bg-slate-700/30 p-4 text-center">
          <p>Generating personalized feedback...</p>
          <div className="mt-2 inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-green-500"></div>
        </div>
      ) : (
        <div className="mb-8">
          <h3 className="mb-3 text-xl font-semibold">AI-Powered Feedback</h3>
          <div className="rounded-lg bg-slate-700/30 p-4">
            {aiFeedback?.summary && (
              <p className="mb-4">{aiFeedback.summary}</p>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {aiFeedback?.strengths && aiFeedback.strengths.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium text-green-400">
                    Your Strengths
                  </h4>
                  <ul className="list-disc space-y-1 pl-5">
                    {aiFeedback.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiFeedback?.improvements &&
                aiFeedback.improvements.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium text-yellow-400">
                      Areas for Improvement
                    </h4>
                    <ul className="list-disc space-y-1 pl-5">
                      {aiFeedback.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {aiFeedback?.recommendations &&
              aiFeedback.recommendations.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 font-medium text-blue-400">
                    Personalized Recommendations
                  </h4>
                  <ul className="list-disc space-y-1 pl-5">
                    {aiFeedback.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}

      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Link
          href={`/student/modules/${moduleId}`}
          className="rounded bg-slate-700 px-6 py-3 text-center text-white hover:bg-slate-600"
        >
          Review This Module
        </Link>

        <Link
          href="/student/modules"
          className="rounded bg-green-600 px-6 py-3 text-center text-white hover:bg-green-700"
        >
          Explore More Modules
        </Link>

        <Link
          href="/student"
          className="rounded bg-blue-600 px-6 py-3 text-center text-white hover:bg-blue-700"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
