import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 401 })
    }
    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 })
    }

    const { data, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('user_id', session.user.id)
      .order('is_default', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('Addresses API error:', error)
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 })
  }
}
