'use client'

import { useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'

// Mock data for student progress
const mockProgressData = {
  modulesCompleted: 3,
  totalModules: 6,
  avgPreTestScore: 58,
  avgPostTestScore: 76,
  overallImprovement: 18,
  modules: [
    {
      id: 'osi-model',
      name: 'OSI Model',
      completed: true,
      preTest: 65,
      postTest: 82,
      improvement: 17,
    },
    {
      id: 'subnetting',
      name: 'Subnetting',
      completed: true,
      preTest: 42,
      postTest: 78,
      improvement: 36,
    },
    {
      id: 'routing',
      name: 'Routing',
      completed: true,
      preTest: 67,
      postTest: 68,
      improvement: 1,
    },
    {
      id: 'switching',
      name: 'Switching',
      completed: false,
      preTest: null,
      postTest: null,
      improvement: null,
    },
    {
      id: 'protocols',
      name: 'Network Protocols',
      completed: false,
      preTest: null,
      postTest: null,
      improvement: null,
    },
    {
      id: 'security',
      name: 'Network Security',
      completed: false,
      preTest: null,
      postTest: null,
      improvement: null,
    },
  ],
  recommendations: [
    'Review subnetting fundamentals - there is still room for improvement',
    'You excel at understanding routing concepts - consider advanced topics',
    'Focus on network security basics as your next learning priority',
  ],
}

export default function StudentProgress() {
  const { user, userProfile, isLoading, signOut } = useUser()
  const [timeRange, setTimeRange] = useState('all-time')

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
          <p>Please log in to access your progress.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl p-3">
      <div className="mt-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Learning Progress</h1>
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

        {/* Progress Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-slate-800 p-4">
            <h3 className="mb-2 text-lg font-semibold">Modules Completed</h3>
            <p className="text-3xl font-bold text-green-400">
              {mockProgressData.modulesCompleted}/
              {mockProgressData.totalModules}
            </p>
            <p className="text-sm text-slate-400">Progress</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <h3 className="mb-2 text-lg font-semibold">Avg. Pre-Test</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {mockProgressData.avgPreTestScore}%
            </p>
            <p className="text-sm text-slate-400">Score</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <h3 className="mb-2 text-lg font-semibold">Avg. Post-Test</h3>
            <p className="text-3xl font-bold text-green-400">
              {mockProgressData.avgPostTestScore}%
            </p>
            <p className="text-sm text-slate-400">Score</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <h3 className="mb-2 text-lg font-semibold">Improvement</h3>
            <p className="text-3xl font-bold text-blue-400">
              +{mockProgressData.overallImprovement}%
            </p>
            <p className="text-sm text-slate-400">Gain</p>
          </div>
        </div>

        {/* Module Progress */}
        <div className="mb-8 rounded-lg bg-slate-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">Module Progress</h2>
          <div className="space-y-4">
            {mockProgressData.modules.map((module) => (
              <div
                key={module.id}
                className="border-b border-slate-700 pb-4 last:border-0 last:pb-0"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{module.name}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      module.completed
                        ? 'bg-green-900/50 text-green-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {module.completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                {module.completed ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Pre-Test</p>
                      <p className="font-medium">{module.preTest}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Post-Test</p>
                      <p className="font-medium">{module.postTest}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Improvement</p>
                      <p className="font-medium text-green-400">
                        +{module.improvement}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Link
                      href={`/student/modules/${module.id}`}
                      className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                    >
                      Start Learning
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-8 rounded-lg bg-slate-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            AI Learning Recommendations
          </h2>
          <ul className="space-y-2">
            {mockProgressData.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-green-400">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/student/modules"
            className="rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700"
          >
            Continue Learning
          </Link>
          <button className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
            Download Progress Report
          </button>
        </div>
      </div>
    </div>
  )
}
