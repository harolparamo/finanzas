import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback for build time if environment variables are not provided
    if (!supabaseUrl || !supabaseAnonKey) {
        return createBrowserClient(
            'https://xyz.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5eiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjg2MDk3NjAwLCJleHAiOjIxNDU5MTY4MDB9.placeholder'
        )
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
