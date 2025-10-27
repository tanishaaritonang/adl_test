import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase'
import RoleGuard from '@/components/RoleGuard'
import { UserProvider } from '@/contexts/UserContext'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile to determine role
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profileData?.role) {
    return (
      <div className="flex h-full items-center justify-center">
        No role assigned. Please contact admin.
      </div>
    )
  }

  // Redirect based on role
  if (profileData.role === 'instructor') {
    redirect('/instructor')
  } else if (profileData.role === 'student') {
    redirect('/student')
  }

  return (
    <div className="flex h-full items-center justify-center">
      No role assigned. Please contact admin.
    </div>
  )
}
