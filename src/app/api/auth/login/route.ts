import { createServiceClient } from '@/lib/supabase/service'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()
        console.log(`[Proxy Login] Attempting for: ${email}`)
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
