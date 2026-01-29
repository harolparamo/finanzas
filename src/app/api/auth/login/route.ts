import { createServiceClient } from '@/lib/supabase/service'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        console.log(`[Proxy Login] Attempting for: ${email}`)
        console.log(`[Proxy Login] Supabase URL: ${supabaseUrl}`)

        // Connectivity pre-check
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const ping = await fetch(supabaseUrl, { signal: controller.signal, cache: 'no-store' });
            console.log(`[Proxy Login] Network Check: Reachable (Status ${ping.status})`);
            clearTimeout(timeoutId);
        } catch (netErr: any) {
            console.error(`[Proxy Login] Network Check FAILED: ${netErr.message}`);
            // Don't return here, attempt login anyway but we'll see this in logs
        }

        const supabase = createServerClient()

        let { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        // If email not confirmed, try to confirm it with admin client and retry
        if (error && error.message.toLowerCase().includes('email not confirmed')) {
            console.log(`[Proxy Login] Email not confirmed for ${email}. Attempting auto-confirmation...`)
            const adminClient = createServiceClient()

            // Get user by email to get their ID
            const { data: users, error: listError } = await adminClient.auth.admin.listUsers()
            const userToConfirm = users?.users.find(u => u.email === email)

            if (userToConfirm) {
                const { error: confirmError } = await adminClient.auth.admin.updateUserById(
                    userToConfirm.id,
                    { email_confirm: true }
                )

                if (!confirmError) {
                    console.log(`[Proxy Login] Auto-confirmed ${email}. Retrying login...`)
                    // Retry login
                    const retry = await supabase.auth.signInWithPassword({ email, password })
                    data = retry.data
                    error = retry.error
                }
            }
        }

        if (error || !data.user) {
            console.error(`[Proxy Login] Error: ${error?.message || 'User not found'}`)
            return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 401 })
        }

        // Fetch profile to return everything atomic
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

        console.log(`[Proxy Login] Success for: ${email}`)
        return NextResponse.json({ user: { ...data.user, ...profile } })
    } catch (error: any) {
        console.error(`[Proxy Login] Fatal Exception:`, error)
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.stack,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        }, { status: 500 })
    }
}
