import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const select = searchParams.get('select') || '*'

    if (!table) return NextResponse.json({ error: 'Table is required' }, { status: 400 })

    const supabase = createClient()

    // Check if user is authenticated for logging
    const { data: { user } } = await supabase.auth.getUser()
    console.log(`[Proxy GET] Table: ${table}, User: ${user?.id || 'Not logged in'}`)

    const { data, error } = await supabase.from(table).select(select)

    if (error) {
        console.error(`[Proxy GET] Error for ${table}:`, error.message)
        return NextResponse.json({ error: error.message, data: [] }, { status: 400 })
    }

    console.log(`[Proxy GET] Success for ${table}: ${data?.length || 0} items`)
    return NextResponse.json({ data })
}

export async function POST(request: Request) {
    const { table, item, select = '*' } = await request.json()
    if (!table || !item) return NextResponse.json({ error: 'Table and item are required' }, { status: 400 })

    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prepare item with user_id to ensure RLS compliance
    const itemWithUser = Array.isArray(item)
        ? item.map(i => ({ ...i, user_id: user.id }))
        : { ...item, user_id: user.id }

    // If it's a single item (has ID or is new single item), use single()
    if (!Array.isArray(itemWithUser) || (itemWithUser as any).id) {
        const { data, error } = await supabase.from(table).upsert(itemWithUser).select(select).single()
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ data })
    } else {
        const { data, error } = await supabase.from(table).upsert(itemWithUser).select(select)
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ data })
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const id = searchParams.get('id')

    if (!table || !id) return NextResponse.json({ error: 'Table and id are required' }, { status: 400 })

    const supabase = createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
}
