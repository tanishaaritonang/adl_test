'use client'

import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'
import { createBrowserClient } from '@/utils/supabase'
import { redirect } from 'next/navigation'

export default function AuthButton() {
  const { user, userProfile, isLoading, signOut } = useUser()
  const supabase = createBrowserClient()

  if (isLoading) {
    return <div className="flex items-center gap-4">Loading...</div>
  }

  return user ? (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end">
        <span>Hi, {userProfile?.full_name || user.email}!</span>
        <span
          className={`rounded px-2 py-1 text-sm ${
            userProfile?.role === 'instructor'
              ? 'bg-blue-500 text-white'
              : 'bg-green-500 text-white'
          }`}
        >
          {userProfile?.role || 'No role'}
        </span>
      </div>
      <button
        onClick={signOut}
        className="bg-btn-background hover:bg-btn-background-hover rounded-md px-4 py-2 no-underline"
      >
        Logout
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      className="bg-btn-background hover:bg-btn-background-hover flex rounded-md px-3 py-2 no-underline"
    >
      Login
    </Link>
  )
}
