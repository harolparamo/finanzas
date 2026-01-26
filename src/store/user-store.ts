import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
    name: string
    email: string
    avatarUrl: string | null
    currency: string
    timezone: string

    setName: (name: string) => void
    setAvatarUrl: (url: string | null) => void
    setCurrency: (currency: string) => void
    setTimezone: (timezone: string) => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            name: 'Usuario Demo',
            email: 'demo@example.com',
            avatarUrl: null,
            currency: 'COP',
            timezone: 'America/Bogota',

            setName: (name) => set({ name }),
            setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
            setCurrency: (currency) => set({ currency }),
            setTimezone: (timezone) => set({ timezone }),
        }),
        {
            name: 'finanzas-user-storage',
        }
    )
)
