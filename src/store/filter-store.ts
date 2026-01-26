import { create } from 'zustand'
import { FilterState } from '@/types/database'

interface FilterStoreState extends FilterState {
    globalSearch: string
    setGlobalSearch: (query: string) => void
    setMonth: (month: number) => void
    setYear: (year: number) => void
    setCategory: (category_id: string | undefined) => void
    setPaymentMethod: (method: 'cash' | 'card' | 'all' | undefined) => void
    setCreditCard: (card_id: string | undefined) => void
    setSearch: (search: string | undefined) => void
    resetFilters: () => void
}

const currentDate = new Date()

export const useFilterStore = create<FilterStoreState>((set) => ({
    globalSearch: '',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    category_id: undefined,
    payment_method: 'all',
    credit_card_id: undefined,
    search: undefined,

    setGlobalSearch: (globalSearch) => set({ globalSearch }),
    setMonth: (month) => set({ month }),
    setYear: (year) => set({ year }),
    setCategory: (category_id) => set({ category_id }),
    setPaymentMethod: (payment_method) => set({ payment_method }),
    setCreditCard: (credit_card_id) => set({ credit_card_id }),
    setSearch: (search) => set({ search }),

    resetFilters: () => set({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        category_id: undefined,
        payment_method: 'all',
        credit_card_id: undefined,
        search: undefined,
    }),
}))
