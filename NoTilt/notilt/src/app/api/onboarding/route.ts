import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient(false)

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Auth session missing' }, { status: 401 })
  }

  const { handle, displayName, instruments, strategy } = await req.json()

  if (!handle || !displayName) {
    return NextResponse.json({ error: 'Handle and display name are required' }, { status: 400 })
  }

  const { error } = await supabase.from('traders').insert({
    user_id: user.id,
    handle: handle.toLowerCase().trim(),
    display_name: displayName,
    instruments,
    strategy,
    verified: false,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That handle is already taken' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
