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
        try {
            // Priority 1: Check Demo Mode
            if (typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true') {
                // const { mockUser } = await import('@/lib/mock-data') // Already imported
                set({ user: mockUser, isAuthenticated: true, isLoading: false })
                return
            }

            // Priority 2: Online Check via API Proxy (Professional fix for Mixed Content)
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                const response = await fetch('/api/auth/session')
                const { user } = await response.json()
                if (user) {
                    set({ user, isAuthenticated: true, isLoading: false })
                    return
                }
            } else {
                // Local check directly with Supabase
                const { createClient } = await import('@/lib/supabase/client') // Moved import inside
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()

                if (session?.user) { // Check session.user
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    set({
                        user: { ...session.user, ...profile },
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

    login: async (email: string, password: string) => {
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
    if (typeof window !== 'undefined') {
        localStorage.removeItem('demo_mode')
    }

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
