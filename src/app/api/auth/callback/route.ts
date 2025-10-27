import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the Auth Helpers package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-sign-in-with-code-exchange
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?message=Authentication failed`,
      )
    }

    // Check if this is a new user and create a profile
    if (data?.user) {
      try {
        // Attempt to create a profile, but ignore duplicate key errors
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || null,
            role: 'student', // Default role is student
          },
        ])

        if (profileError) {
          if (profileError.code === '23505') {
            // Unique violation - profile already exists, which is fine
            console.log('Profile already exists for user:', data.user.id)
          } else if (profileError.code === '23503') {
            // Foreign key violation - user might not be fully created yet
            console.warn(
              'User may not be fully created yet, profile creation delayed:',
              profileError,
            )
            // This is expected in some cases, we can ignore it as the user exists in auth
          } else {
            console.error('Error creating profile:', profileError)
          }
        }
      } catch (err) {
        console.error('Unexpected error creating profile:', err)
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
