'use client'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userProfile, signOut } = useUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Instructor Panel
                </h1>
              </div>
              <nav className="ml-6 flex space-x-8">
                <Link
                  href="/instructor/dashboard"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Dashboard
                </Link>
                <Link
                  href="/instructor/upload"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Upload Module
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="relative ml-3">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {userProfile?.full_name || userProfile?.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
