import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase'
import RoleGuard from '@/components/RoleGuard'

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">My Courses</h2>
            <p className="mb-4 text-slate-300">
              Enroll and access your enrolled courses.
            </p>
            <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              Browse Courses
            </button>
          </div>

          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Assignments</h2>
            <p className="mb-4 text-slate-300">
              View and submit your assignments.
            </p>
            <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              View Assignments
            </button>
          </div>

          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Grades</h2>
            <p className="mb-4 text-slate-300">
              Check your grades and academic progress.
            </p>
            <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              View Grades
            </button>
          </div>

          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Resources</h2>
            <p className="mb-4 text-slate-300">
              Access study materials and resources.
            </p>
            <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              View Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
