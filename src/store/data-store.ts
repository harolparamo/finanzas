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

        const { useAuthStore } = await import('./auth-store')
        const user = useAuthStore.getState().user
        const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true'
        const isDemoUser = user?.email?.toLowerCase() === 'demo@example.com'

        // Mock data loading if it's the demo user OR if global mock mode is ON
        if (isDemoUser || isDemoMode || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
            try {
                // Ensure we get the latest mock data
                const {
                    mockExpenses, mockIncome, mockCreditCards,
                    mockBudgets, mockGoals, mockCategories
                } = await import('../lib/mock-data')

                // Small delay to ensure smooth UI transitions
                await new Promise(resolve => setTimeout(resolve, 500))

                set({
                    expenses: mockExpenses,
                    income: mockIncome,
                    cards: mockCreditCards,
                    budgets: mockBudgets,
                    goals: mockGoals,
                    categories: mockCategories,
                    isLoading: false
                })
                return
            } catch (e) {
                console.error("Critical: Failed to load mock data", e)
                set({ error: "No se pudieron cargar los datos de prueba", isLoading: false })
                return
            }
        }

        try {
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
                categories: categories || [],
                isLoading: false
            })
        } catch (error: any) {
            set({ error: error.message, isLoading: false })
        }
    },

    // Expense Actions
    addExpense: async (data) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: newExpense, error } = await supabase
            .from('expenses')
            .insert({
                user_id: user.id,
                name: data.name,
                amount: data.amount,
                category_id: data.category_id || null,
                credit_card_id: data.credit_card_id || null,
                payment_method: data.payment_method,
                notes: data.notes || null,
                is_recurring: data.is_recurring || false,
                expense_date: data.expense_date.toISOString().split('T')[0],
                month: data.expense_date.getMonth() + 1,
                year: data.expense_date.getFullYear(),
            })
            .select('*, category:categories(*), credit_card:credit_cards(*)')
            .single()

        if (error) throw error
        if (newExpense) {
            set((state) => ({ expenses: [newExpense, ...state.expenses] }))
        }
    },

    updateExpense: async (id, data) => {
        const updateData: any = { ...data }
        if (data.expense_date) {
            updateData.expense_date = data.expense_date.toISOString().split('T')[0]
            updateData.month = data.expense_date.getMonth() + 1
            updateData.year = data.expense_date.getFullYear()
        }

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
    },

    deleteExpense: async (id) => {
        const { error } = await supabase.from('expenses').delete().eq('id', id)
        if (error) throw error
        set((state) => ({
            expenses: state.expenses.filter(e => e.id !== id)
        }))
    },

    // Income Actions
    addIncome: async (data) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: newIncome, error } = await supabase
            .from('income')
            .insert({
                user_id: user.id,
                name: data.name,
                amount: data.amount,
                source: data.source || null,
                notes: data.notes || null,
                is_recurring: data.is_recurring || false,
                income_date: data.income_date.toISOString().split('T')[0],
                month: data.income_date.getMonth() + 1,
                year: data.income_date.getFullYear(),
            })
            .select()
            .single()

        if (error) throw error
        if (newIncome) {
            set((state) => ({ income: [newIncome, ...state.income] }))
        }
    },

    updateIncome: async (id, data) => {
        const updateData: any = { ...data }
        if (data.income_date) {
            updateData.income_date = data.income_date.toISOString().split('T')[0]
            updateData.month = data.income_date.getMonth() + 1
            updateData.year = data.income_date.getFullYear()
        }

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
    },

    deleteIncome: async (id) => {
        const { error } = await supabase.from('income').delete().eq('id', id)
        if (error) throw error
        set((state) => ({
            income: state.income.filter(i => i.id !== id)
        }))
    },

    // Card Actions
    addCard: async (data) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: newCard, error } = await supabase
            .from('credit_cards')
            .insert({
                user_id: user.id,
                name: data.name,
                last_four_digits: data.last_four_digits || null,
                bank_name: data.bank_name || null,
                credit_limit: data.credit_limit || 0,
                cut_off_day: data.cut_off_day || null,
                payment_day: data.payment_day || null,
                color: data.color || '#6366f1',
            })
            .select()
            .single()

        if (error) throw error
        if (newCard) {
            set((state) => ({ cards: [...state.cards, newCard] }))
        }
    },

    updateCard: async (id, data) => {
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
    },

    deleteCard: async (id) => {
        const { error } = await supabase.from('credit_cards').delete().eq('id', id)
        if (error) throw error
        set((state) => ({
            cards: state.cards.filter(c => c.id !== id)
        }))
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
