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
    seedCategories: () => Promise<void>
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
                // Fetch via Proxy with explicit selects for joins
                const configs = [
                    { table: 'expenses', select: '*, category:categories(*), credit_card:credit_cards(*)' },
                    { table: 'income', select: '*' },
                    { table: 'credit_cards', select: '*' },
                    { table: 'budgets', select: '*, category:categories(*)' },
                    { table: 'goals', select: '*' },
                    { table: 'categories', select: '*' }
                ]

                const results = await Promise.all(
                    configs.map(c => fetch(`/api/data/proxy?table=${c.table}&select=${encodeURIComponent(c.select)}`).then(r => r.json()))
                )

                // Log results for debugging online
                results.forEach((res, i) => {
                    if (res.error) console.error(`[Store Fetch] Error fetching ${configs[i].table}:`, res.error)
                })

                set({
                    expenses: results[0].data || [],
                    income: results[1].data || [],
                    cards: results[2].data || [],
                    budgets: results[3].data || [],
                    goals: results[4].data || [],
                    categories: results[5].data || [],
                })

                // Self-healing: Seed categories if missing for online user
                const cats = results[5].data || []
                if (cats.length === 0) {
                    console.log('[DataStore] No categories found via Proxy. Seeding defaults...')
                    await get().seedCategories()
                }
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

                // Self-healing: Seed categories if missing for real local user
                if (!categories || categories.length === 0) {
                    console.log('[DataStore] No categories found for user. Seeding defaults...')
                    await get().seedCategories()
                }
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
                const formattedExpense = {
                    ...expense,
                    expense_date: expense.expense_date.toISOString().split('T')[0],
                    month: expense.expense_date.getMonth() + 1,
                    year: expense.expense_date.getFullYear(),
                }
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table: 'expenses',
                        item: formattedExpense,
                        select: '*, category:categories(*), credit_card:credit_cards(*)'
                    })
                })
                const { data, error } = await response.json()
                if (error) throw new Error(error)
                console.log(`[Store Add Expense] Proxy response data:`, data); // Log the data received from the proxy
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
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table: 'expenses',
                        item: { id, ...updateData },
                        select: '*, category:categories(*), credit_card:credit_cards(*)'
                    })
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
                const formattedIncome = {
                    ...income,
                    income_date: income.income_date.toISOString().split('T')[0],
                    month: income.income_date.getMonth() + 1,
                    year: income.income_date.getFullYear(),
                }
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: 'income', item: formattedIncome })
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
    addBudget: async (budget) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table: 'budgets',
                        item: budget,
                        select: '*, category:categories(*)'
                    })
                })
                const { data, error } = await response.json()
                if (error) throw new Error(error)
                set((state) => ({ budgets: [...state.budgets, data] }))
            } else {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: newBudget, error } = await supabase
                    .from('budgets')
                    .insert({
                        user_id: user.id,
                        category_id: budget.category_id,
                        amount: budget.amount,
                        month: budget.month,
                        year: budget.year,
                    })
                    .select('*, category:categories(*)')
                    .single()

                if (error) throw error
                set((state) => ({ budgets: [...state.budgets, newBudget] }))
            }
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    updateBudget: async (id, data) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table: 'budgets',
                        item: { id, ...data },
                        select: '*, category:categories(*)'
                    })
                })
                const { data: updatedBudget, error } = await response.json()
                if (error) throw new Error(error)
                set((state) => ({
                    budgets: state.budgets.map(b => b.id === id ? updatedBudget : b)
                }))
            } else {
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
            }
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    deleteBudget: async (id) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                await fetch(`/api/data/proxy?table=budgets&id=${id}`, { method: 'DELETE' })
                set((state) => ({ budgets: state.budgets.filter(b => b.id !== id) }))
            } else {
                const { error } = await supabase.from('budgets').delete().eq('id', id)
                if (error) throw error
                set((state) => ({ budgets: state.budgets.filter(b => b.id !== id) }))
            }
        } catch (error: any) {
            set({ error: error.message })
        } finally {
            set({ isLoading: false })
        }
    },

    // Goal Actions
    addGoal: async (goal) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: 'goals', item: goal })
                })
                const { data, error } = await response.json()
                if (error) throw new Error(error)
                set((state) => ({ goals: [...state.goals, data] }))
            } else {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: newGoal, error } = await supabase
                    .from('goals')
                    .insert({
                        user_id: user.id,
                        name: goal.name,
                        target_amount: goal.target_amount,
                        target_date: goal.target_date?.toISOString().split('T')[0] || null,
                        color: goal.color || '#22c55e',
                        icon: goal.icon || 'target',
                    })
                    .select()
                    .single()

                if (error) throw error
                set((state) => ({ goals: [...state.goals, newGoal] }))
            }
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    updateGoal: async (id, data) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            const updateData: any = { ...data }
            if (data.target_date) {
                updateData.target_date = data.target_date.toISOString().split('T')[0]
            }

            if (isOnline) {
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ table: 'goals', item: { id, ...updateData } })
                })
                const { data: updatedGoal, error } = await response.json()
                if (error) throw new Error(error)
                set((state) => ({
                    goals: state.goals.map(g => g.id === id ? updatedGoal : g)
                }))
            } else {
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
            }
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    deleteGoal: async (id) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                await fetch(`/api/data/proxy?table=goals&id=${id}`, { method: 'DELETE' })
                set((state) => ({ goals: state.goals.filter(g => g.id !== id) }))
            } else {
                const { error } = await supabase.from('goals').delete().eq('id', id)
                if (error) throw error
                set((state) => ({ goals: state.goals.filter(g => g.id !== id) }))
            }
        } catch (error: any) {
            set({ error: error.message })
        } finally {
            set({ isLoading: false })
        }
    },

    addContribution: async (goalId, amount) => {
        set({ isLoading: true, error: null })
        try {
            const isOnline = typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1'

            if (isOnline) {
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table: 'goal_contributions',
                        item: { goal_id: goalId, amount, contribution_date: new Date().toISOString().split('T')[0] }
                    })
                })
                const { error } = await response.json()
                if (error) throw new Error(error)

                // Refresh specific goal
                const goalResponse = await fetch(`/api/data/proxy?table=goals&id=${goalId}`)
                const { data: updatedGoal } = await goalResponse.json()
                if (updatedGoal) {
                    set((state) => ({ goals: state.goals.map(g => g.id === goalId ? updatedGoal : g) }))
                }
            } else {
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
        } catch (error: any) {
            set({ error: error.message })
        } finally {
            set({ isLoading: false })
        }
    },

    seedCategories: async () => {
        const authStore = (await import('./auth-store')).useAuthStore.getState()
        const user = authStore.user
        if (!user) return

        const { mockCategories } = await import('@/lib/mock-data')
        const defaultCats = mockCategories.map(cat => ({
            user_id: user.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            is_default: true,
            sort_order: cat.sort_order
        }))

        const isOnline = typeof window !== 'undefined' &&
            window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1'

        try {
            if (isOnline) {
                const response = await fetch('/api/data/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table: 'categories',
                        item: defaultCats,
                        select: '*'
                    })
                })
                const { data, error } = await response.json()
                if (error) throw new Error(error)
                set({ categories: data })
            } else {
                const { data, error } = await supabase
                    .from('categories')
                    .insert(defaultCats)
                    .select()

                if (error) throw error
                set({ categories: data || [] })
            }
        } catch (error: any) {
            console.error('[DataStore] Seeding failed:', error)
        }
    }
}))
