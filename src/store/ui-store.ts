import { create } from 'zustand'

interface UIState {
    sidebarOpen: boolean
    mobileMenuOpen: boolean
    activeModal: string | null
    modalData: Record<string, unknown> | null

    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    toggleMobileMenu: () => void
    setMobileMenuOpen: (open: boolean) => void
    openModal: (modalId: string, data?: Record<string, unknown>) => void
    closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    mobileMenuOpen: false,
    activeModal: null,
    modalData: null,

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
    setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),

    openModal: (modalId, data = {}) => set({ activeModal: modalId, modalData: data }),
    closeModal: () => set({ activeModal: null, modalData: null }),
}))
