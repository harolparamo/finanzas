import { createServiceClient } from '@/lib/supabase/service'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, password, full_name } = await request.json()
        console.log(`[Proxy Register] Attempting for: ${email}`)

        const adminClient = createServiceClient()

        // Create user with admin client to bypass email confirmation
        const { data, error } = await adminClient.auth.admin.createUser({
            email,
            password,
            user_metadata: { full_name },
            email_confirm: true
        })

        if (error || !data.user) {
            console.error(`[Proxy Register] Error: ${error?.message || 'User creation failed'}`)
            return NextResponse.json({ error: error?.message || 'Registration failed' }, { status: 400 })
        }

        // Fetch profile (created by DB trigger usually)
        const supabase = createServerClient()
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

        console.log(`[Proxy Register] Success for: ${email}`)
        return NextResponse.json({ user: { ...data.user, ...profile } })
    } catch (error: any) {
        console.error(`[Proxy Register] Fatal: ${error.message}`)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
