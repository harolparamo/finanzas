import { create } from 'zustand'
import { Profile } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface AuthState {
    user: Profile | null
    isLoading: boolean
    isAuthenticated: boolean
    error: string | null
    setUser: (user: Profile | null) => void
    login: (email: string, password: string) => Promise<boolean>
    register: (email: string, password: string, fullName: string) => Promise<boolean>
    logout: () => Promise<void>
    checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    checkSession: async () => {
        set({ isLoading: true })
        try {
            // 1. Check Demo Mode flag
            if (typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true') {
                const { mockProfile } = await import('@/lib/mock-data')
                set({ user: mockProfile, isAuthenticated: true, isLoading: false })
                return
            }

            // 2. Identify Environment (Online uses Proxy)
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                const response = await fetch('/api/auth/session')
                if (response.ok) {
                    const { user } = await response.json()
                    if (user) {
                        console.log(`[AuthStore] Online session confirmed for ${user.email}`)
                        set({ user, isAuthenticated: true })
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('auth_user', JSON.stringify(user))
                        }
                        return
                    } else {
                        console.log('[AuthStore] Online session endpoint returned null user')
                    }
                } else {
                    console.error(`[AuthStore] Session endpoint error: ${response.status}`)
                }

                // Fallback to localStorage if online session check fails
                if (typeof window !== 'undefined') {
                    const savedUser = localStorage.getItem('auth_user')
                    if (savedUser) {
                        try {
                            const user = JSON.parse(savedUser)
                            set({ user, isAuthenticated: true })
                            console.log('[AuthStore] Session restored from localStorage')
                        } catch (e) {
                            localStorage.removeItem('auth_user')
                        }
                    }
                }
            } else {
                // Local direct access
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()

                if (session) {
                    let { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    // Self-healing: Create profile if missing
                    if (profileError && profileError.code === 'PGRST116') {
                        console.log(`[AuthStore] Profile missing for ${session.user.email}. Creating...`)
                        const { data: newProfile, error: createError } = await supabase
                            .from('profiles')
                            .insert({
                                id: session.user.id,
                                email: session.user.email!,
                                full_name: (session.user as any).user_metadata?.full_name || null
                            })
                            .select()
                            .single()

                        if (!createError) profile = newProfile
                        else console.error('[AuthStore] Failed to create missing profile:', createError)
                    }

                    set({
                        user: { ...session.user, ...profile } as Profile,
                        isAuthenticated: true,
                    })
                }
            }
        } catch (error) {
            console.error('Session check failed:', error)
        } finally {
            set({ isLoading: false })
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
            // Handle Demo User
            if (email.toLowerCase() === 'demo@example.com') {
                const { mockProfile } = await import('@/lib/mock-data')
                set({ user: mockProfile, isAuthenticated: true })
                if (typeof window !== 'undefined') {
                    localStorage.setItem('demo_mode', 'true')
                }
                return true
            }

            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                })

                let result;
                try {
                    result = await response.json()
                } catch (e) {
                    const text = await response.text()
                    console.error(`[AuthStore] Failed to parse response (Status ${response.status}):`, text.slice(0, 500))
                    throw new Error(`Server returned status ${response.status} (invalid JSON)`)
                }

                if (!response.ok) {
                    console.error(`[AuthStore] Online login failed (Status ${response.status}):`, result.error)
                    throw new Error(result.error || 'Login failed')
                }

                console.log(`[AuthStore] Online login success for ${result.user?.email}`)
                set({ user: result.user, isAuthenticated: true })
                if (typeof window !== 'undefined') {
                    localStorage.setItem('auth_user', JSON.stringify(result.user))
                }
                return true
            } else {
                const supabase = createClient()
                const { data, error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error

                let { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single()

                // Self-healing: Create profile if missing
                if (profileError && profileError.code === 'PGRST116') {
                    console.log(`[AuthStore] Profile missing for ${data.user.email}. Creating...`)
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert({
                            id: data.user.id,
                            email: data.user.email!,
                            full_name: (data.user as any).user_metadata?.full_name || null
                        })
                        .select()
                        .single()

                    if (!createError) profile = newProfile
                    else console.error('[AuthStore] Failed to create missing profile during login:', createError)
                }

                set({
                    user: { ...data.user, ...profile } as Profile,
                    isAuthenticated: true,
                })
                return true
            }
        } catch (error: any) {
            set({ error: error.message })
            return false
        } finally {
            set({ isLoading: false })
        }
    },

    register: async (email, password, full_name) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, full_name })
                })
                const result = await response.json()
                if (!response.ok) throw new Error(result.error || 'Registration failed')

                // Set user and log them in
                set({ user: result.user, isAuthenticated: true })
                if (typeof window !== 'undefined') {
                    localStorage.setItem('auth_user', JSON.stringify(result.user))
                }
                return true
            } else {
                const supabase = createClient()
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name } },
                })
                if (error) throw error
                return await get().login(email, password)
            }
        } catch (error: any) {
            console.error('[AuthStore] Registration error:', error)
            set({ error: error.message })
            return false
        } finally {
            set({ isLoading: false })
        }
    },

    logout: async () => {
        set({ isLoading: true })
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('demo_mode')
                localStorage.removeItem('auth_user')
            }
            const supabase = createClient()
            await supabase.auth.signOut()
            set({ user: null, isAuthenticated: false })
            if (typeof window !== 'undefined') {
                window.location.href = '/'
            }
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            set({ isLoading: false })
        }
    },
}))
