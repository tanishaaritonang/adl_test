'use client'

import { useState } from 'react'
import { useUser } from '@/contexts/UserContext'

// Mock data for analytics
const mockAnalyticsData = {
  classPerformance: [
    { module: 'OSI Model', preTest: 42, postTest: 75 },
    { module: 'Subnetting', preTest: 38, postTest: 68 },
    { module: 'Routing', preTest: 55, postTest: 82 },
    { module: 'Switching', preTest: 48, postTest: 76 },
    { module: 'Protocols', preTest: 60, postTest: 88 },
  ],
  studentProgress: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      completion: 85,
      avgScore: 78,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      completion: 92,
      avgScore: 88,
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      completion: 70,
      avgScore: 65,
    },
    {
      id: 4,
      name: 'Alice Williams',
      email: 'alice@example.com',
      completion: 98,
      avgScore: 92,
    },
    {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      completion: 75,
      avgScore: 70,
    },
  ],
  topicDifficulty: [
    { topic: 'OSI Layers', difficulty: 'Medium', avgScore: 72 },
    { topic: 'IP Addressing', difficulty: 'Hard', avgScore: 65 },
    { topic: 'Routing Protocols', difficulty: 'Medium', avgScore: 78 },
    { topic: 'VLANs', difficulty: 'Hard', avgScore: 60 },
    { topic: 'Network Security', difficulty: 'Easy', avgScore: 85 },
  ],
}

export default function InstructorAnalytics() {
  const { user, userProfile, isLoading, signOut } = useUser()
  const [timeRange, setTimeRange] = useState('monthly')

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl p-3">
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-500"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="w-full max-w-6xl p-3">
        <div className="mt-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p>Please log in to access the instructor dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl p-3">
      <div className="mt-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Instructor Analytics</h1>
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

        {/* Time Range Selector */}
        <div className="mb-6 flex justify-end">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setTimeRange('weekly')}
              className={`rounded-l-lg px-4 py-2 text-sm font-medium ${
                timeRange === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('monthly')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('quarterly')}
              className={`rounded-r-lg px-4 py-2 text-sm font-medium ${
                timeRange === 'quarterly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>

        {/* Learning Gains Chart */}
        <div className="mb-8 rounded-lg bg-slate-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Learning Gains (Pre-Test vs Post-Test)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-2 text-left">Module</th>
                  <th className="px-4 py-2 text-left">Pre-Test Average</th>
                  <th className="px-4 py-2 text-left">Post-Test Average</th>
                  <th className="px-4 py-2 text-left">Improvement</th>
                  <th className="px-4 py-2 text-left">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {mockAnalyticsData.classPerformance.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-700 last:border-0"
                  >
                    <td className="px-4 py-3">{item.module}</td>
                    <td className="px-4 py-3">{item.preTest}%</td>
                    <td className="px-4 py-3">{item.postTest}%</td>
                    <td className="px-4 py-3 text-green-400">
                      +{item.postTest - item.preTest}%
                    </td>
                    <td className="px-4 py-3">
                      {Math.max(70, item.postTest - 20)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Progress */}
        <div className="mb-8 rounded-lg bg-slate-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Student Progress Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Completion</th>
                  <th className="px-4 py-2 text-left">Avg. Score</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockAnalyticsData.studentProgress.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-700 last:border-0"
                  >
                    <td className="px-4 py-3">{student.name}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {student.email}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-24 rounded-full bg-slate-700">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${student.completion}%` }}
                          ></div>
                        </div>
                        <span>{student.completion}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{student.avgScore}%</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          student.completion >= 90
                            ? 'bg-green-900/50 text-green-300'
                            : student.completion >= 70
                              ? 'bg-yellow-900/50 text-yellow-300'
                              : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        {student.completion >= 90
                          ? 'Excellent'
                          : student.completion >= 70
                            ? 'Good'
                            : 'Needs Help'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Topic Difficulty Analysis */}
        <div className="mb-8 rounded-lg bg-slate-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Topic Difficulty Analysis
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockAnalyticsData.topicDifficulty.map((topic, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-700 p-4"
              >
                <h3 className="mb-2 font-medium">{topic.topic}</h3>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Difficulty:</span>
                  <span className="capitalize">{topic.difficulty}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg. Score:</span>
                  <span>{topic.avgScore}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
                  <div
                    className={`h-2 rounded-full ${
                      topic.avgScore >= 80
                        ? 'bg-green-500'
                        : topic.avgScore >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${topic.avgScore}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
