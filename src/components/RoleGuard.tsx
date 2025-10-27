'use client'

import { useUser } from '@/contexts/UserContext'
import { ReactNode } from 'react'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const { userProfile, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
    )
  }

  if (
    !userProfile ||
    !userProfile.role ||
    !allowedRoles.includes(userProfile.role)
  ) {
    return fallback
  }

  return <>{children}</>
}
