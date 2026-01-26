import { create } from 'zustand'
import { Profile } from '@/types/database'
import { mockProfile } from '@/lib/mock-data'

interface AuthState {
    user: Profile | null
    isLoading: boolean
    isAuthenticated: boolean
    setUser: (user: Profile | null) => void
    setLoading: (loading: boolean) => void
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    initMockAuth: () => void
    checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    setLoading: (isLoading) => set({ isLoading }),

    checkSession: async () => {
        set({ isLoading: true })
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
            set({
                user: {
                    id: session.user.id,
                    email: session.user.email || '',
                    full_name: session.user.user_metadata.full_name || 'Usuario',
                    avatar_url: session.user.user_metadata.avatar_url || null,
                    currency: 'USD',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                    created_at: session.user.created_at,
                    updated_at: new Date().toISOString()
                },
                isAuthenticated: true,
                isLoading: false
            })
        } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
        }
    },

    login: async (email: string, password: string) => {
        const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

        if (useMockData) {
            set({ user: { ...mockProfile, email }, isAuthenticated: true, isLoading: false })
            return true
        }

        // Real Supabase auth
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            console.error('Login error:', error.message)
            return false
        }

        if (data.user) {
            // Here you would typically fetch the profile from your 'profiles' table
            // For now, we'll map the auth user to our Profile type
            set({
                user: {
                    id: data.user.id,
                    email: data.user.email || '',
                    full_name: data.user.user_metadata.full_name || 'Usuario',
                    avatar_url: data.user.user_metadata.avatar_url || null,
                    currency: 'USD', // Default currency
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', // Default timezone
                    created_at: data.user.created_at,
                    updated_at: new Date().toISOString()
                },
                isAuthenticated: true,
                isLoading: false
            })
            return true
        }

        return false
    },

    logout: async () => {
        const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

        if (!useMockData) {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            await supabase.auth.signOut()
        }

        set({ user: null, isAuthenticated: false })
    },

    initMockAuth: () => {
        const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
        if (useMockData) {
            set({ user: mockProfile, isAuthenticated: true, isLoading: false })
        } else {
            set({ isLoading: false })
        }
    },
}))
