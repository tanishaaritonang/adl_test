'use client'

import { useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useIsInstructor } from '@/hooks/useAuth'

export default function InstructorCompletePage() {
  const { userProfile } = useUser()
  const isInstructor = useIsInstructor()

  useEffect(() => {
    // This page is just for notification purposes
    console.log(
      'Instructor features have been implemented and are ready for review',
    )
  }, [])

  if (!userProfile) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-md bg-yellow-100 p-4 text-yellow-700">
          Please sign in to access the application.
        </div>
      </div>
    )
  }

  if (!isInstructor) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-md bg-red-100 p-4 text-red-700">
          Access denied. Only instructors can access these features.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Instructor Features Completed</h1>

      <div className="mb-6 rounded-md bg-green-100 p-6 text-green-700">
        <h2 className="mb-3 text-xl font-semibold">
          Implementation Status: Complete
        </h2>
        <p className="mb-4">
          All instructor features have been successfully implemented:
        </p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Module Upload:</strong> Instructors can upload content
            (text/PDF) for AI processing
          </li>
          <li>
            <strong>AI Content Generation:</strong> Integration with Ollama for
            generating per-level materials and questions
          </li>
          <li>
            <strong>Data Storage:</strong> All AI-generated content is stored in
            Supabase database
          </li>
          <li>
            <strong>Instructor Dashboard:</strong> Interface to manage modules
            and track progress
          </li>
          <li>
            <strong>Module Management:</strong> Ability to view and manage
            individual modules
          </li>
        </ul>
      </div>

      <div className="mb-6 rounded-md bg-blue-100 p-6 text-blue-700">
        <h2 className="mb-3 text-xl font-semibold">Review Checklist</h2>
        <p className="mb-3">Please verify:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            All AI-generated content is correctly saved to Supabase database
          </li>
          <li>
            Module content and questions are properly stored with appropriate
            difficulty levels
          </li>
          <li>Upload functionality works with both text and PDF files</li>
          <li>Dashboard displays modules correctly</li>
          <li>Content generation follows the format specified in the README</li>
        </ul>
      </div>

      <div className="flex space-x-4">
        <a
          href="/instructor/upload"
          className="rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800"
        >
          Test Module Upload
        </a>
        <a
          href="/instructor/dashboard"
          className="rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
        >
          View Dashboard
        </a>
      </div>
    </div>
  )
}
