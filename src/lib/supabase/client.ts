import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback only for local development
    if (!supabaseUrl || !supabaseAnonKey) {
        if (process.env.NODE_ENV === 'production') {
            console.error('[Supabase Client] CRITICAL: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!')
        }
        return createBrowserClient(
            'https://xyz.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5eiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjg2MDk3NjAwLCJleHAiOjIxNDU5MTY4MDB9.placeholder'
        )
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
