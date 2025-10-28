import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase'
import Link from 'next/link'

export default async function StudentPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is a student
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || profileData?.role !== 'student') {
    redirect('/unauthorized')
  }

  return (
    <div className="w-full max-w-4xl p-3">
      <div className="mt-8">
        <h1 className="mb-6 text-3xl font-bold">Student Dashboard</h1>

        <div className="mb-8 rounded-lg bg-slate-800 p-4">
          <h2 className="mb-2 text-xl font-semibold">
            Welcome to Adaptive Learning!
          </h2>
          <p className="mb-4 text-slate-300">
            Enhance your computer networking skills with our AI-powered adaptive
            learning system. Start with a pre-test to assess your knowledge,
            receive a personalized learning path, and complete a post-test to
            measure your improvement.
          </p>
          <Link
            href="/student/modules"
            className="inline-block rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Start Learning
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Learning Modules</h2>
            <p className="mb-4 text-slate-300">
              Explore various networking topics with AI-generated content
              tailored to your level.
            </p>
            <Link
              href="/student/modules"
              className="inline-block rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Browse Modules
            </Link>
          </div>

          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">My Progress</h2>
            <p className="mb-4 text-slate-300">
              Track your learning progress and see your improvement over time.
            </p>
            <Link
              href="/student/progress"
              className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              View Progress
            </Link>
          </div>

          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Assignments</h2>
            <p className="mb-4 text-slate-300">
              View and submit your assignments.
            </p>
            <button className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
              View Assignments
            </button>
          </div>

          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Resources</h2>
            <p className="mb-4 text-slate-300">
              Access study materials and additional resources.
            </p>
            <button className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700">
              View Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
