import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')

    if (!table) return NextResponse.json({ error: 'Table is required' }, { status: 400 })

    const supabase = createClient()
    const { data, error } = await supabase.from(table).select('*')

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
}

export async function POST(request: Request) {
    const { table, item } = await request.json()
    if (!table || !item) return NextResponse.json({ error: 'Table and item are required' }, { status: 400 })

    const supabase = createClient()
    const { data, error } = await supabase.from(table).insert(item).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const id = searchParams.get('id')

    if (!table || !id) return NextResponse.json({ error: 'Table and id are required' }, { status: 400 })

    const supabase = createClient()
    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
}
