import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback for build time if environment variables are not provided
    if (!supabaseUrl || !supabaseAnonKey) {
        return createBrowserClient(
            'https://placeholder-url.supabase.co',
            'placeholder-key'
        )
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
