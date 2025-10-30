// app/instructor/InstructorDashboard.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { getModules, type Module } from '@/utils/supabase-client'
import ModuleAIContent from '@/components/ModuleAIContent'

export default function InstructorDashboard() {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoadingModules, setIsLoadingModules] = useState(true)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  const { user, userProfile, isLoading: isUserLoading } = useUser()
  const isInstructor = useMemo(
    () => (userProfile?.role ?? '').toLowerCase().trim() === 'instructor',
    [userProfile?.role],
  )

  useEffect(() => {
    if (isUserLoading) return
    if (!user || !isInstructor) {
      setModules([])
      setIsLoadingModules(false)
      return
    }

    let mounted = true
    const run = async () => {
      try {
        setIsLoadingModules(true)
        const data = await getModules()
        if (mounted) setModules(data)
      } catch (e) {
        console.error('Error fetching modules:', e)
      } finally {
        if (mounted) setIsLoadingModules(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [isUserLoading, user?.id, isInstructor])

  if (isUserLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-black">
        <p className="text-black">Loading user...</p>
      </div>
    )
  }

  if (!user || !isInstructor) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-black">
        <div className="rounded-md bg-red-100 p-4 text-black">
          Access denied. Only instructors can view this page.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-6 text-black">
      <h1 className="mb-6 text-3xl font-bold">Instructor Dashboard</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Your Modules</h2>
        <a
          href="/instructor/upload"
          className="mb-4 inline-block rounded-md bg-green-700 px-4 py-2 text-black hover:bg-green-800"
        >
          Create New Module
        </a>

        {isLoadingModules ? (
          <p className="text-black">Loading modules...</p>
        ) : modules.length === 0 ? (
          <p className="text-black">No modules created yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => {
              const isOpen = selectedModule === module.id
              return (
                <div
                  key={module.id}
                  className="rounded-lg border p-4 text-black transition-shadow hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold">{module.title}</h3>
                  <p className="mt-1 text-sm text-black">
                    {module.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        setSelectedModule(isOpen ? null : module.id)
                      }
                      className="rounded bg-blue-600 px-2 py-1 text-sm text-black hover:bg-blue-700"
                    >
                      {isOpen ? 'Hide Details' : 'View Details'}
                    </button>
                    <a
                      href={`/instructor/module/${module.id}`}
                      className="rounded bg-green-600 px-2 py-1 text-sm text-black hover:bg-green-700"
                    >
                      Manage
                    </a>
                  </div>

                  {isOpen && (
                    <div className="mt-3 rounded-md bg-gray-50 p-3 text-black">
                      <h4 className="font-medium">Module Information</h4>
                      <p>
                        <span className="font-semibold">ID:</span> {module.id}
                      </p>
                      <p>
                        <span className="font-semibold">Created:</span>{' '}
                        {new Date(module.created_at).toLocaleDateString()}
                      </p>

                      {/* AI Content saved in DB */}
                      <div className="mt-3">
                        <ModuleAIContent
                          aiContentRaw={(module as any).ai_content ?? null}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Student Progress Overview
        </h2>
        <div className="rounded-lg bg-white p-6 text-black shadow">
          <p className="text-black">
            Track student progress, test results, and overall trends.
          </p>
          <p className="mt-2 text-black">
            This section will show aggregated data about student performance
            across your modules.
          </p>
        </div>
      </div>
    </div>
  )
}
