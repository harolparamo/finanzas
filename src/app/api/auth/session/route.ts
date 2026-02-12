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
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        // Self-healing online: Create profile if missing
        if (profileError && profileError.code === 'PGRST116') {
            console.log(`[Proxy Session] Profile missing online for ${user.email}. Creating...`)
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email!,
                    full_name: (user as any).user_metadata?.full_name || null
                })
                .select()
                .single()

            if (!createError) {
                profile = newProfile
                console.log(`[Proxy Session] Successfully created missing profile online for ${user.email}`)
            } else {
                console.error('[Proxy Session] Failed to create missing profile online:', createError.message)
            }
        }

        return NextResponse.json({
            user: { ...user, ...profile }
        })
    } catch (error: any) {
        console.error(`[Proxy Session] Fatal: ${error.message}`)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
