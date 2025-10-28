'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'

// Define module types
type Module = {
  id: string
  title: string
  description: string
  icon: string
}

const modules: Module[] = [
  {
    id: 'osi-model',
    title: 'OSI Model',
    description: 'Understand the 7 layers of the OSI model and their functions',
    icon: '🌐',
  },
  {
    id: 'subnetting',
    title: 'Subnetting',
    description: 'Learn IP addressing, subnet masks, and network division',
    icon: '🔢',
  },
  {
    id: 'routing',
    title: 'Routing',
    description: 'Explore routing protocols and path determination',
    icon: '🔄',
  },
  {
    id: 'switching',
    title: 'Switching',
    description: 'Understand Layer 2 switching and VLANs',
    icon: '🔌',
  },
  {
    id: 'protocols',
    title: 'Network Protocols',
    description: 'Study TCP, UDP, HTTP, and other essential protocols',
    icon: '📜',
  },
  {
    id: 'security',
    title: 'Network Security',
    description:
      'Learn about firewalls, encryption, and security best practices',
    icon: '🔒',
  },
]

export default function ModuleSelectionPage() {
  const { user, userProfile, isLoading, signOut } = useUser()
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

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
          <p>Please log in to access the learning modules.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl p-3">
      <div className="mt-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Learning Modules</h1>
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

        <p className="mb-8 text-slate-300">
          Select a networking topic to begin your adaptive learning journey.
          Each module includes AI-generated pre-tests, personalized learning
          paths, and post-tests to measure your improvement.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module.id}
              className={`rounded-lg border-2 bg-slate-800 p-6 ${
                selectedModule === module.id
                  ? 'border-green-500 bg-slate-700'
                  : 'border-slate-700 hover:border-slate-600'
              } transition-all duration-200`}
            >
              <div className="mb-4 text-4xl">{module.icon}</div>
              <h2 className="mb-2 text-xl font-semibold">{module.title}</h2>
              <p className="mb-4 text-slate-300">{module.description}</p>
              <Link
                href={`/student/modules/${module.id}`}
                className="inline-block rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
              >
                Start Learning
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
