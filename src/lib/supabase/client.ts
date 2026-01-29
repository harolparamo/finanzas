import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback only for local development
    if (!supabaseUrl || !supabaseAnonKey) {
        if (process.env.NODE_ENV === 'production') {
            console.error('[Supabase Client] WARN: Environment variables missing. Using hardcoded fallback.')
            return createBrowserClient(
                'http://antigravity-supabase-2789c8-76-13-100-74.traefik.me',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjkyNjk5MTUsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.LQFvzeOVKK5PKdrtI9iFrxtHmTSQEUadHzSEIG9rlQI'
            )
        }
        return createBrowserClient(
            'https://xyz.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5eiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjg2MDk3NjAwLCJleHAiOjIxNDU5MTY4MDB9.placeholder'
        )
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
