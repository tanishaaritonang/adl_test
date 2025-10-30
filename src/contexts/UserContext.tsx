'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { createBrowserClient } from '@/utils/supabase'
import { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  role: 'student' | 'instructor' | null
  created_at: string | null
}

interface UserContextType {
  user: User | null
  userProfile: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log('r', user)
      if (user) {
        setUser(user)
        // Fetch user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, created_at')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
        } else if (data) {
          setUserProfile(data as UserProfile)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }

      setIsLoading(false)
    }

    fetchUserAndProfile()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        // Fetch user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, created_at')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
        } else if (data) {
          setUserProfile(data as UserProfile)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }

  return (
    <UserContext.Provider value={{ user, userProfile, isLoading, signOut }}>
      {user && JSON.stringify(user)}
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
