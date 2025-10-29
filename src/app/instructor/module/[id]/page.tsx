'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import {
  getModuleById,
  getModuleContentsByModule,
  getItemsByModuleAndLevel,
  getItemsByModuleAndType,
} from '@/utils/supabase-client'
import { Module, ModuleContent, Item } from '@/utils/supabase-client'

export default function ManageModulePage() {
  const { id } = useParams<{ id: string }>()
  const [module, setModule] = useState<Module | null>(null)
  const [contents, setContents] = useState<ModuleContent[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { userProfile } = useUser()

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !userProfile) return

      try {
        // Fetch module details
        const moduleData = await getModuleById(id)
        setModule(moduleData)

        // Fetch module contents
        const contentData = await getModuleContentsByModule(id)
        setContents(contentData)

        // Fetch all items for this module
        const itemData = await getItemsByModuleAndType(id, 'practice') // Get practice items
        setItems(itemData)
      } catch (error) {
        console.error('Error fetching module data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, userProfile])

  if (!userProfile || userProfile.role !== 'instructor') {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-md bg-red-100 p-4 text-red-700">
          Access denied. Only instructors can manage modules.
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p>Loading module...</p>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-md bg-red-100 p-4 text-red-700">
          Module not found.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Manage Module: {module.title}</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Module Details</h2>
        <div className="rounded-lg bg-white p-6 shadow">
          <p>
            <span className="font-semibold">Title:</span> {module.title}
          </p>
          <p>
            <span className="font-semibold">Description:</span>{' '}
            {module.description || 'No description'}
          </p>
          <p>
            <span className="font-semibold">Created:</span>{' '}
            {new Date(module.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">
          Learning Content by Level
        </h2>
        <div className="space-y-6">
          {['easy', 'medium', 'high'].map((level) => {
            const content = contents.find((c) => c.level === level)
            return (
              <div key={level} className="rounded-lg border p-4">
                <h3 className="mb-2 text-lg font-semibold capitalize">
                  {level} Level
                </h3>
                {content ? (
                  <div className="whitespace-pre-line">{content.content}</div>
                ) : (
                  <p className="text-gray-500">
                    No content available for this level
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Module Questions</h2>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p>No questions available for this module.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{item.question}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-semibold">Type:</span>{' '}
                      {item.question_type} |
                      <span className="font-semibold"> Level:</span>{' '}
                      {item.level} |
                      <span className="font-semibold"> Test Type:</span>{' '}
                      {item.type}
                    </p>
                    {item.options && item.options.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold">Options:</p>
                        <ul className="list-disc pl-5">
                          {item.options.map((option, idx) => (
                            <li key={idx}>{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-2">
                      <p className="font-semibold">Answer:</p>
                      <p>{item.answer}</p>
                    </div>
                    {item.explanation && (
                      <div className="mt-2">
                        <p className="font-semibold">Explanation:</p>
                        <p>{item.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
