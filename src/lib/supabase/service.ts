import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        if (process.env.NODE_ENV === 'production') {
            console.warn('[Supabase Service] Environment variables missing. Using hardcoded fallback.')
            return createClient(
                'http://antigravity-supabase-2789c8-76-13-100-74.traefik.me',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjkyNjk5MTUsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.nq3oyklRE1xrjgCudFcLJt9FT2M4AyLiwjbXCR1kOns',
                {
                    auth: { autoRefreshToken: false, persistSession: false },
                    global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
                }
            )
        }
        throw new Error('Supabase Service Role credentials not found')
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        global: {
            fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
        }
    })
}
