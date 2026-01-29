import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback only for local development
    if (!supabaseUrl || !supabaseAnonKey) {
        if (process.env.NODE_ENV === 'production') {
            console.error('[Supabase Server] WARN: Environment variables missing. Using hardcoded fallback.')
            return createServerClient(
                'http://antigravity-supabase-2789c8-76-13-100-74.traefik.me',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjkyNjk5MTUsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.LQFvzeOVKK5PKdrtI9iFrxtHmTSQEUadHzSEIG9rlQI',
                {
                    cookies: {
                        get(name: string) { return undefined },
                        set(name: string, value: string, options: CookieOptions) { },
                        remove(name: string, options: CookieOptions) { },
                    },
                }
            )
        }
        return createServerClient(
            'https://xyz.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5eiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjg2MDk3NjAwLCJleHAiOjIxNDU5MTY4MDB9.placeholder',
            {
                cookies: {
                    get(name: string) { return undefined },
                    set(name: string, value: string, options: CookieOptions) { },
                    remove(name: string, options: CookieOptions) { },
                },
            }
        )
    }

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    const cookie = cookieStore.get(name)?.value
                    if (cookie) console.log(`[Supabase Server] Cookie found: ${name}`)
                    return cookie
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        const isSecure = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') || false;
                        console.log(`[Supabase Server] Setting cookie: ${name} (Secure: ${isSecure})`)
                        cookieStore.set({
                            name,
                            value,
                            ...options,
                            path: options.path || '/',
                            sameSite: isSecure ? 'lax' : 'lax', // Keep lax for redirects
                            secure: isSecure ? true : false // Only true if we have HTTPS
                        })
                    } catch (error) {
                        console.error(`[Supabase Server] Error setting cookie: ${name}`, error)
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        console.log(`[Supabase Server] Removing cookie: ${name}`)
                        cookieStore.set({
                            name,
                            value: '',
                            ...options,
                            path: options.path || '/',
                            sameSite: options.sameSite || 'lax',
                            secure: options.secure
                        })
                    } catch (error) {
                        console.error(`[Supabase Server] Error removing cookie: ${name}`, error)
                    }
                },
            },
        }
    )
}
