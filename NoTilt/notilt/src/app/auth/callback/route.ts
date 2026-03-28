import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription ?? error)}`)
  }

  if (code) {
    try {
      const supabase = await createServerSupabaseClient(false)
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`)
      }

      if (data.session) {
        // If a specific next destination was requested, use it
        if (next && next !== '/onboarding') {
          return NextResponse.redirect(`${origin}${next}`)
        }

        // Otherwise check if trader profile exists
        const { data: trader } = await supabase
          .from('traders')
          .select('id')
          .eq('user_id', data.session.user.id)
          .single()

        // If profile exists go to dashboard, otherwise go to onboarding
        const redirectTo = trader ? '/dashboard' : '/onboarding'
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    } catch (err) {
      console.error('Callback exception:', err)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
