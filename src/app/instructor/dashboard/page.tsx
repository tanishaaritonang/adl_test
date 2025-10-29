'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import {
  getModules,
  getModuleContentsByModule,
  getItemsByModuleAndLevel,
  getPlacementByUserAndModule,
} from '@/utils/supabase-client'
import { Module } from '@/utils/supabase-client'

export default function InstructorDashboard() {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const { userProfile } = useUser()

  useEffect(() => {
    const fetchModules = async () => {
      if (!userProfile) return

      try {
        const moduleData = await getModules()
        setModules(moduleData)
      } catch (error) {
        console.error('Error fetching modules:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModules()
  }, [userProfile])

  if (!userProfile || userProfile.role !== 'instructor') {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-md bg-red-100 p-4 text-red-700">
          Access denied. Only instructors can view this page.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Instructor Dashboard</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Your Modules</h2>
        <a
          href="/instructor/upload"
          className="mb-4 inline-block rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800"
        >
          Create New Module
        </a>

        {isLoading ? (
          <p>Loading modules...</p>
        ) : modules.length === 0 ? (
          <p>No modules created yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className="rounded-lg border p-4 transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-semibold">{module.title}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {module.description}
                </p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() =>
                      setSelectedModule(
                        selectedModule === module.id ? null : module.id,
                      )
                    }
                    className="rounded bg-blue-600 px-2 py-1 text-sm text-white hover:bg-blue-700"
                  >
                    {selectedModule === module.id
                      ? 'Hide Details'
                      : 'View Details'}
                  </button>
                  <a
                    href={`/instructor/module/${module.id}`}
                    className="rounded bg-green-600 px-2 py-1 text-sm text-white hover:bg-green-700"
                  >
                    Manage
                  </a>
                </div>

                {selectedModule === module.id && (
                  <div className="mt-3 rounded-md bg-gray-50 p-3">
                    <h4 className="font-medium">Module Information</h4>
                    <p>
                      <span className="font-semibold">ID:</span> {module.id}
                    </p>
                    <p>
                      <span className="font-semibold">Created:</span>{' '}
                      {new Date(module.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Student Progress Overview
        </h2>
        <div className="rounded-lg bg-white p-6 shadow">
          <p>Track student progress, test results, and overall trends.</p>
          <p className="mt-2 text-gray-600">
            This section will show aggregated data about student performance
            across your modules.
          </p>
        </div>
      </div>
    </div>
  )
}
