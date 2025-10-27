import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase'
import RoleGuard from '@/components/RoleGuard'
import { createBrowserClient } from '@/utils/supabase'

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

  return (
    <div className="w-full max-w-4xl p-3">
      <div className="mt-8">
        <h1 className="mb-6 text-3xl font-bold">Instructor Dashboard</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Manage Courses</h2>
            <p className="mb-4 text-slate-300">
              Create and manage your courses, syllabus, and course materials.
            </p>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Create New Course
            </button>
          </div>

          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Student Management</h2>
            <p className="mb-4 text-slate-300">
              {"View and manage your students' progress and grades."}
            </p>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              View Students
            </button>
          </div>

          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Assignments</h2>
            <p className="mb-4 text-slate-300">
              Create and grade assignments for your courses.
            </p>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Manage Assignments
            </button>
          </div>

          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">Analytics</h2>
            <p className="mb-4 text-slate-300">
              Track your course performance and student engagement.
            </p>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
