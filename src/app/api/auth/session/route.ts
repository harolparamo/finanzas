import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            console.log(`[Proxy Session] No active session found`)
            return NextResponse.json({ user: null }, { status: 200 })
        }

        console.log(`[Proxy Session] Session found for: ${user.email}`)

        // Fetch profile data
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        return NextResponse.json({
            user: { ...user, ...profile }
        })
    } catch (error: any) {
        console.error(`[Proxy Session] Fatal: ${error.message}`)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
