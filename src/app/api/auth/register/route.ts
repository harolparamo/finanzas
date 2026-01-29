import { createServiceClient } from '@/lib/supabase/service'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, password, full_name } = await request.json()
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://antigravity-supabase-2789c8-76-13-100-74.traefik.me'
        console.log(`[Proxy Register] Attempting for: ${email}`)
        console.log(`[Proxy Register] Supabase URL: ${supabaseUrl}`)

        // Connectivity pre-check
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const ping = await fetch(supabaseUrl, { signal: controller.signal, cache: 'no-store' });
            console.log(`[Proxy Register] Network Check: Reachable (Status ${ping.status})`);
            clearTimeout(timeoutId);
        } catch (netErr: any) {
            console.error(`[Proxy Register] Network Check FAILED: ${netErr.message}`);
        }

        const adminClient = createServiceClient()

        // Create user with admin client to bypass email confirmation
        const { data, error } = await adminClient.auth.admin.createUser({
            email,
            password,
            user_metadata: { full_name },
            email_confirm: true
        })

        if (data.user) {
            console.log(`[Proxy Register] User created successfully: ${data.user.id}`)
        }

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
        console.error(`[Proxy Register] Fatal Exception:`, error)
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.stack,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        }, { status: 500 })
    }
}
