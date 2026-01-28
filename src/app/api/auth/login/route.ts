import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()
        console.log(`[Proxy Login] Attempting for: ${email}`)
        const supabase = createClient()

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error(`[Proxy Login] Error: ${error.message}`)
            return NextResponse.json({ error: error.message }, { status: 401 })
        }

        console.log(`[Proxy Login] Success for: ${email}`)
        return NextResponse.json({ user: data.user })
    } catch (error: any) {
        console.error(`[Proxy Login] Fatal: ${error.message}`)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
