'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: {
  handle: string
  displayName: string
  instruments: string[]
  strategy: string
}) {
  const supabase = await createServerSupabaseClient(false)

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Auth session missing')
  }

  const { error } = await supabase.from('traders').insert({
    user_id: user.id,
    handle: formData.handle.toLowerCase().trim(),
    display_name: formData.displayName,
    instruments: formData.instruments,
    strategy: formData.strategy,
    verified: false,
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error('That handle is already taken')
    }
    throw new Error(error.message)
  }

  redirect('/dashboard')
}
