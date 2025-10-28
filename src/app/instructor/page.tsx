import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase'
import { createBrowserClient } from '@/utils/supabase'
import Link from 'next/link'

// Mock analytics data
const mockStudentData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    preTestScore: 45,
    postTestScore: 78,
    improvement: 33,
    level: 'medium',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    preTestScore: 72,
    postTestScore: 88,
    improvement: 16,
    level: 'hard',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    preTestScore: 30,
    postTestScore: 65,
    improvement: 35,
    level: 'easy',
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice@example.com',
    preTestScore: 85,
    postTestScore: 92,
    improvement: 7,
    level: 'hard',
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    preTestScore: 52,
    postTestScore: 70,
    improvement: 18,
    level: 'medium',
  },
]

const mockModuleData = [
  {
    id: 'osi-model',
    name: 'OSI Model',
    avgPreTest: 42,
    avgPostTest: 75,
    completionRate: 85,
  },
  {
    id: 'subnetting',
    name: 'Subnetting',
    avgPreTest: 38,
    avgPostTest: 68,
    completionRate: 78,
  },
  {
    id: 'routing',
    name: 'Routing',
    avgPreTest: 55,
    avgPostTest: 82,
    completionRate: 92,
  },
  {
    id: 'switching',
    name: 'Switching',
    avgPreTest: 48,
    avgPostTest: 76,
    completionRate: 80,
  },
  {
    id: 'protocols',
    name: 'Network Protocols',
    avgPreTest: 60,
    avgPostTest: 88,
    completionRate: 88,
  },
]

export default async function InstructorPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is an instructor
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || profileData?.role !== 'instructor') {
    redirect('/unauthorized')
  }

  // Calculate overall statistics
  const totalImprovement = mockStudentData.reduce(
    (sum, student) => sum + student.improvement,
    0,
  )
  const avgImprovement = totalImprovement / mockStudentData.length
  const avgPreTestScore =
    mockStudentData.reduce((sum, student) => sum + student.preTestScore, 0) /
    mockStudentData.length
  const avgPostTestScore =
    mockStudentData.reduce((sum, student) => sum + student.postTestScore, 0) /
    mockStudentData.length

  return (
    <div className="w-full max-w-6xl p-3">
      <div className="mt-8">
        <h1 className="mb-6 text-3xl font-bold">Instructor Dashboard</h1>

        {/* Overall Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-slate-800 p-4">
            <h3 className="mb-2 text-lg font-semibold">Students</h3>
            <p className="text-3xl font-bold text-green-400">
              {mockStudentData.length}
            </p>
            <p className="text-sm text-slate-400">Enrolled</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <h3 className="mb-2 text-lg font-semibold">Avg. Pre-Test</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {Math.round(avgPreTestScore)}%
            </p>
            <p className="text-sm text-slate-400">Score</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <h3 className="mb-2 text-lg font-semibold">Avg. Post-Test</h3>
            <p className="text-3xl font-bold text-green-400">
              {Math.round(avgPostTestScore)}%
            </p>
            <p className="text-sm text-slate-400">Score</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <h3 className="mb-2 text-lg font-semibold">Avg. Improvement</h3>
            <p className="text-3xl font-bold text-blue-400">
              +{Math.round(avgImprovement)}%
            </p>
            <p className="text-sm text-slate-400">Gain</p>
          </div>
        </div>

        {/* Student Performance Table */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Student Performance</h2>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Export Data
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg bg-slate-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Pre-Test</th>
                  <th className="px-4 py-3 text-left">Post-Test</th>
                  <th className="px-4 py-3 text-left">Improvement</th>
                  <th className="px-4 py-3 text-left">Level</th>
                </tr>
              </thead>
              <tbody>
                {mockStudentData.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-700 last:border-0"
                  >
                    <td className="px-4 py-3">{student.name}</td>
                    <td className="px-4 py-3">{student.preTestScore}%</td>
                    <td className="px-4 py-3">{student.postTestScore}%</td>
                    <td
                      className={`px-4 py-3 ${
                        student.improvement > 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {student.improvement > 0 ? '+' : ''}
                      {student.improvement}%
                    </td>
                    <td className="px-4 py-3 capitalize">{student.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module Performance */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Module Performance</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockModuleData.map((module, index) => (
              <div key={index} className="rounded-lg bg-slate-800 p-4">
                <h3 className="mb-2 text-lg font-semibold">{module.name}</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Pre-Test Avg</span>
                      <span>{module.avgPreTest}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-yellow-500"
                        style={{ width: `${module.avgPreTest}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Post-Test Avg</span>
                      <span>{module.avgPostTest}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${module.avgPostTest}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate</span>
                      <span>{module.completionRate}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${module.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Analytics</h2>
            <p className="mb-4 text-slate-300">
              Track class performance, identify common difficulties, and measure
              learning gains.
            </p>
            <Link
              href="/instructor/analytics"
              className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              View Detailed Analytics
            </Link>
          </div>

          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Student Management</h2>
            <p className="mb-4 text-slate-300">
              {"View and manage your students' progress and grades."}
            </p>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Manage Students
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
