'use client'

import { useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { createBrowserSupabaseClient } from '@/utils/supabase'

// Helper function to ensure user profile exists in database
export const useEnsureUserProfile = () => {
  const { user, userProfile, isLoading } = useUser()
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const ensureProfileExists = async () => {
      if (user && !userProfile && !isLoading) {
        // Check if profile already exists
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code === 'PGRST116') {
          // No rows returned
          // Profile doesn't exist, create it
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name:
              user.user_metadata?.full_name ||
              user.email?.split('@')[0] ||
              null,
          })
        } else if (error) {
          console.error('Error checking user profile:', error)
        }
      }
    }

    ensureProfileExists()
  }, [user, userProfile, isLoading, supabase])
}

// Helper function to update user role
export const updateUserRole = async (
  userId: string,
  role: 'student' | 'instructor',
) => {
  const supabase = createBrowserSupabaseClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

// Helper function to check if user is instructor
export const useIsInstructor = () => {
  const { userProfile } = useUser()
  return userProfile?.role === 'instructor'
}

// Helper function to check if user is student
export const useIsStudent = () => {
  const { userProfile } = useUser()
  return userProfile?.role === 'student'
}
