import { create } from 'zustand'
import {
    Expense, Income, CreditCard, Budget, Goal, Category,
    ExpenseFormData, IncomeFormData, CreditCardFormData, BudgetFormData, GoalFormData
} from '@/types/database'
import { createClient } from '../lib/supabase/client'

interface DataState {
    expenses: Expense[]
    income: Income[]
    cards: CreditCard[]
    budgets: Budget[]
    goals: Goal[]
    categories: Category[]
    isLoading: boolean
    error: string | null

    // Actions
    fetchData: () => Promise<void>

    addExpense: (data: ExpenseFormData) => Promise<void>
    updateExpense: (id: string, data: Partial<ExpenseFormData>) => Promise<void>
    deleteExpense: (id: string) => Promise<void>

    addIncome: (data: IncomeFormData) => Promise<void>
    updateIncome: (id: string, data: Partial<IncomeFormData>) => Promise<void>
    deleteIncome: (id: string) => Promise<void>

    addCard: (data: CreditCardFormData) => Promise<void>
    updateCard: (id: string, data: Partial<CreditCardFormData>) => Promise<void>
    deleteCard: (id: string) => Promise<void>

    addBudget: (data: BudgetFormData) => Promise<void>
    updateBudget: (id: string, data: Partial<BudgetFormData>) => Promise<void>
    deleteBudget: (id: string) => Promise<void>

    addGoal: (data: GoalFormData) => Promise<void>
    updateGoal: (id: string, data: Partial<GoalFormData>) => Promise<void>
    deleteGoal: (id: string) => Promise<void>
    addContribution: (goalId: string, amount: number) => Promise<void>
}

const supabase = createClient()

export const useDataStore = create<DataState>((set, get) => ({
    expenses: [],
    income: [],
    cards: [],
    budgets: [],
    goals: [],
    categories: [],
    isLoading: false,
    error: null,

    fetchData: async () => {
        set({ isLoading: true, error: null })
        try {
            const authStore = (await import('./auth-store')).useAuthStore.getState()
            const user = authStore.user

            // Check for Demo Mode flag in localStorage
            const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true'
            const isDemoUser = user?.email?.toLowerCase() === 'demo@example.com' || isDemoMode

            if (isDemoUser) {
                // Ensure auth state is consistent if refresh happened in demo mode
                if (isDemoMode && !user) {
                    await authStore.checkSession()
                }

                const {
                    mockExpenses,
                    mockIncome,
                    mockCreditCards: mockCards,
                    mockBudgets,
                    mockGoals,
                    mockCategories
                } = await import('@/lib/mock-data')

                // Simulate network delay for realistic feel
                await new Promise(resolve => setTimeout(resolve, 500))

                set({
                    expenses: mockExpenses,
                    income: mockIncome,
                    cards: mockCards,
                    budgets: mockBudgets,
                    goals: mockGoals,
                    categories: mockCategories,
                    isLoading: false
                })
                return
            }

            // Real User Fetching
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                // Fetch via Proxy
                const tables = ['expenses', 'income', 'credit_cards', 'budgets', 'goals', 'categories']
                const results = await Promise.all(
                    tables.map(t => fetch(`/api/data/proxy?table=${t === 'credit_cards' ? 'credit_cards' : t}`).then(r => r.json()))
                )

                set({
                    expenses: results[0].data || [],
                    income: results[1].data || [],
                    cards: results[2].data || [],
                    budgets: results[3].data || [],
                    goals: results[4].data || [],
                    categories: results[5].data || [],
                })
            } else {
                // Local Direct Fetch
                const supabase = createClient()
                const [
                    { data: expenses },
                    { data: income },
                    { data: cards },
                    { data: budgets },
                    { data: goals },
                    { data: categories }
                ] = await Promise.all([
                    supabase.from('expenses').select('*, category:categories(*), credit_card:credit_cards(*)').order('expense_date', { ascending: false }),
                    supabase.from('income').select('*').order('income_date', { ascending: false }),
                    supabase.from('credit_cards').select('*').order('created_at', { ascending: true }),
                    supabase.from('budgets').select('*, category:categories(*)'),
                    supabase.from('goals').select('*').order('created_at', { ascending: true }),
                    supabase.from('categories').select('*').order('sort_order', { ascending: true })
                ])

                set({
                    expenses: expenses || [],
                    income: income || [],
                    cards: cards || [],
                    budgets: budgets || [],
                    goals: goals || [],
                    categories: categories || []
                })
            }
        } catch (error: any) {
            set({ error: error.message })
        } finally {
            set({ isLoading: false })
        }
    },

    // Expense Actions
    addExpense: async (expense) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: 'expenses', item: expense })
                })
                const { data, error } = await response.json()
                if (error) throw new Error(error)
                set((state) => ({ expenses: [data, ...state.expenses] }))
            } else {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: newExpense, error } = await supabase
                    .from('expenses')
                    .insert({
                        user_id: user.id,
                        name: expense.name,
                        amount: expense.amount,
                        category_id: expense.category_id || null,
                        credit_card_id: expense.credit_card_id || null,
                        payment_method: expense.payment_method,
                        notes: expense.notes || null,
                        is_recurring: expense.is_recurring || false,
                        expense_date: expense.expense_date.toISOString().split('T')[0],
                        month: expense.expense_date.getMonth() + 1,
                        year: expense.expense_date.getFullYear(),
                    })
                    .select('*, category:categories(*), credit_card:credit_cards(*)')
                    .single()
                if (error) throw error
                set((state) => ({ expenses: [newExpense, ...state.expenses] }))
            }
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    updateExpense: async (id, data) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            const updateData: any = { ...data }
            if (data.expense_date) {
                updateData.expense_date = data.expense_date.toISOString().split('T')[0]
                updateData.month = data.expense_date.getMonth() + 1
                updateData.year = data.expense_date.getFullYear()
            }

            if (isOnline) {
                const response = await fetch('/api/data/proxy', {
                    method: 'POST', // Using POST for update in our proxy implementation for simplicity
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: 'expenses', item: { id, ...updateData } })
                })
                const { data: updatedExpense, error } = await response.json()
                if (error) throw new Error(error)
                set((state) => ({
                    expenses: state.expenses.map(e => e.id === id ? updatedExpense : e)
                }))
            } else {
                const { data: updatedExpense, error } = await supabase
                    .from('expenses')
                    .update(updateData)
                    .eq('id', id)
                    .select('*, category:categories(*), credit_card:credit_cards(*)')
                    .single()

                if (error) throw error
                set((state) => ({
                    expenses: state.expenses.map(e => e.id === id ? updatedExpense : e)
                }))
            }
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    deleteExpense: async (id) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                await fetch(`/api/data/proxy?table=expenses&id=${id}`, { method: 'DELETE' })
                set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) }))
            } else {
                const { error } = await supabase.from('expenses').delete().eq('id', id)
                if (error) throw error
                set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) }))
            }
        } catch (error: any) {
            set({ error: error.message })
        } finally {
            set({ isLoading: false })
        }
    },

    // Income Actions
    addIncome: async (income) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: 'income', item: income })
                })
                const { data, error } = await response.json()
                if (error) throw new Error(error)
                set((state) => ({ income: [data, ...state.income] }))
            } else {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: newIncome, error } = await supabase
                    .from('income')
                    .insert({
                        user_id: user.id,
                        name: income.name,
                        amount: income.amount,
                        source: income.source || null,
                        notes: income.notes || null,
                        is_recurring: income.is_recurring || false,
                        income_date: income.income_date.toISOString().split('T')[0],
                        month: income.income_date.getMonth() + 1,
                        year: income.income_date.getFullYear(),
                    })
                    .select()
                    .single()

                if (error) throw error
                set((state) => ({ income: [newIncome, ...state.income] }))
            }
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    updateIncome: async (id, data) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            const updateData: any = { ...data }
            if (data.income_date) {
                updateData.income_date = data.income_date.toISOString().split('T')[0]
                updateData.month = data.income_date.getMonth() + 1
                updateData.year = data.income_date.getFullYear()
            }

            if (isOnline) {
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: 'income', item: { id, ...updateData } })
                })
                const { data: updatedIncome, error } = await response.json()
                if (error) throw new Error(error)
                set((state) => ({
                    income: state.income.map(i => i.id === id ? updatedIncome : i)
                }))
            } else {
                const { data: updatedIncome, error } = await supabase
                    .from('income')
                    .update(updateData)
                    .eq('id', id)
                    .select()
                    .single()

                if (error) throw error
                set((state) => ({
                    income: state.income.map(i => i.id === id ? updatedIncome : i)
                }))
            }
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    deleteIncome: async (id) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                await fetch(`/api/data/proxy?table=income&id=${id}`, { method: 'DELETE' })
                set((state) => ({ income: state.income.filter(i => i.id !== id) }))
            } else {
                const { error } = await supabase.from('income').delete().eq('id', id)
                if (error) throw error
                set((state) => ({ income: state.income.filter(i => i.id !== id) }))
            }
        } catch (error: any) {
            set({ error: error.message })
        } finally {
            set({ isLoading: false })
        }
    },

    // Card Actions
    addCard: async (card) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: 'credit_cards', item: card })
                })
                const { data, error } = await response.json()
                if (error) throw new Error(error)
                set((state) => ({ cards: [...state.cards, data] }))
            } else {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: newCard, error } = await supabase
                    .from('credit_cards')
                    .insert({
                        user_id: user.id,
                        name: card.name,
                        last_four_digits: card.last_four_digits || null,
                        bank_name: card.bank_name || null,
                        credit_limit: card.credit_limit || 0,
                        cut_off_day: card.cut_off_day || null,
                        payment_day: card.payment_day || null,
                        color: card.color || '#6366f1',
                    })
                    .select()
                    .single()

                if (error) throw error
                set((state) => ({ cards: [...state.cards, newCard] }))
            }
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    updateCard: async (id, data) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: 'credit_cards', item: { id, ...data } })
                })
                const { data: updatedCard, error } = await response.json()
                if (error) throw new Error(error)
                set((state) => ({
                    cards: state.cards.map(c => c.id === id ? updatedCard : c)
                }))
            } else {
                const { data: updatedCard, error } = await supabase
                    .from('credit_cards')
                    .update(data)
                    .eq('id', id)
                    .select()
                    .single()

                if (error) throw error
                set((state) => ({
                    cards: state.cards.map(c => c.id === id ? updatedCard : c)
                }))
            }
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    deleteCard: async (id) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                await fetch(`/api/data/proxy?table=credit_cards&id=${id}`, { method: 'DELETE' })
                set((state) => ({ cards: state.cards.filter(c => c.id !== id) }))
            } else {
                const { error } = await supabase.from('credit_cards').delete().eq('id', id)
                if (error) throw error
                set((state) => ({ cards: state.cards.filter(c => c.id !== id) }))
            }
        } catch (error: any) {
            set({ error: error.message })
        } finally {
            set({ isLoading: false })
        }
    },

    // Budget Actions
    addBudget: async (data) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: newBudget, error } = await supabase
            .from('budgets')
            .insert({
                user_id: user.id,
                category_id: data.category_id,
                amount: data.amount,
                month: data.month,
                year: data.year,
            })
            .select('*, category:categories(*)')
            .single()

        if (error) throw error
        if (newBudget) {
            set((state) => ({ budgets: [...state.budgets, newBudget] }))
        }
    },

    updateBudget: async (id, data) => {
        const { data: updatedBudget, error } = await supabase
            .from('budgets')
            .update(data)
            .eq('id', id)
            .select('*, category:categories(*)')
            .single()

        if (error) throw error
        set((state) => ({
            budgets: state.budgets.map(b => b.id === id ? updatedBudget : b)
        }))
    },

    deleteBudget: async (id) => {
        const { error } = await supabase.from('budgets').delete().eq('id', id)
        if (error) throw error
        set((state) => ({
            budgets: state.budgets.filter(b => b.id !== id)
        }))
    },

    // Goal Actions
    addGoal: async (data) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: newGoal, error } = await supabase
            .from('goals')
            .insert({
                user_id: user.id,
                name: data.name,
                target_amount: data.target_amount,
                target_date: data.target_date?.toISOString().split('T')[0] || null,
                color: data.color || '#22c55e',
                icon: data.icon || 'target',
            })
            .select()
            .single()

        if (error) throw error
        if (newGoal) {
            set((state) => ({ goals: [...state.goals, newGoal] }))
        }
    },

    updateGoal: async (id, data) => {
        const updateData: any = { ...data }
        if (data.target_date) {
            updateData.target_date = data.target_date.toISOString().split('T')[0]
        }

        const { data: updatedGoal, error } = await supabase
            .from('goals')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        set((state) => ({
            goals: state.goals.map(g => g.id === id ? updatedGoal : g)
        }))
    },

    deleteGoal: async (id) => {
        const { error } = await supabase.from('goals').delete().eq('id', id)
        if (error) throw error
        set((state) => ({
            goals: state.goals.filter(g => g.id !== id)
        }))
    },

    addContribution: async (goalId, amount) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('goal_contributions')
            .insert({
                user_id: user.id,
                goal_id: goalId,
                amount: amount,
                contribution_date: new Date().toISOString().split('T')[0]
            })

        if (error) throw error

        // Refresh goals to get updated current_amount (handled by DB trigger)
        const { data: updatedGoal } = await supabase
            .from('goals')
            .select('*')
            .eq('id', goalId)
            .single()

        if (updatedGoal) {
            set((state) => ({
                goals: state.goals.map(g => g.id === goalId ? updatedGoal : g)
            }))
        }
    }
}))
