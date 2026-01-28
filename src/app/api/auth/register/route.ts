import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, password, full_name } = await request.json()
        console.log(`[Proxy Register] Attempting for: ${email}`)
        const supabase = createClient()

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                },
            },
        })

        if (error) {
            console.error(`[Proxy Register] Error: ${error.message}`)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        console.log(`[Proxy Register] Success for: ${email}`)
        return NextResponse.json({ user: data.user })
    } catch (error: any) {
        console.error(`[Proxy Register] Fatal: ${error.message}`)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
