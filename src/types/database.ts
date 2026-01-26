// Database types for the expense control application

export interface Profile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    currency: string
    timezone: string
    created_at: string
    updated_at: string
}

export interface Category {
    id: string
    user_id: string
    name: string
    icon: string
    color: string
    is_default: boolean
    sort_order: number
    created_at: string
    updated_at: string
}

export interface CreditCard {
    id: string
    user_id: string
    name: string
    last_four_digits: string | null
    bank_name: string | null
    credit_limit: number
    cut_off_day: number | null
    payment_day: number | null
    color: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Expense {
    id: string
    user_id: string
    category_id: string | null
    credit_card_id: string | null
    name: string
    amount: number
    payment_method: 'cash' | 'card'
    expense_date: string
    month: number
    year: number
    notes: string | null
    is_recurring: boolean
    created_at: string
    updated_at: string
    // Joined fields
    category?: Category
    credit_card?: CreditCard
}

export interface Income {
    id: string
    user_id: string
    name: string
    amount: number
    income_date: string
    month: number
    year: number
    source: string | null
    notes: string | null
    is_recurring: boolean
    created_at: string
    updated_at: string
}

export interface Budget {
    id: string
    user_id: string
    category_id: string
    amount: number
    month: number
    year: number
    created_at: string
    updated_at: string
    // Joined fields
    category?: Category
    spent?: number
}

export interface Goal {
    id: string
    user_id: string
    name: string
    target_amount: number
    current_amount: number
    target_date: string | null
    color: string
    icon: string
    is_completed: boolean
    completed_at: string | null
    created_at: string
    updated_at: string
}

export interface GoalContribution {
    id: string
    user_id: string
    goal_id: string
    amount: number
    contribution_date: string
    notes: string | null
    created_at: string
}

// Summary types
export interface MonthlySummary {
    totalIncome: number
    totalExpenses: number
    balance: number
    totalBudget: number
    budgetRemaining: number
    incomeChange: number // percentage vs previous month
    expenseChange: number // percentage vs previous month
}

export interface MonthlyChartData {
    month: string
    monthNumber: number
    income: number
    expenses: number
    balance: number
}

export interface CategorySummary {
    category_id: string
    category_name: string
    category_color: string
    category_icon: string
    total_amount: number
    transaction_count: number
    budget_amount: number
    remaining_budget: number
    percentage: number
}

// Form types
export interface ExpenseFormData {
    name: string
    amount: number
    category_id: string
    payment_method: 'cash' | 'card'
    credit_card_id?: string
    expense_date: Date
    notes?: string
    is_recurring?: boolean
}

export interface IncomeFormData {
    name: string
    amount: number
    income_date: Date
    source?: string
    notes?: string
    is_recurring?: boolean
}

export interface CreditCardFormData {
    name: string
    bank_name?: string
    last_four_digits?: string
    credit_limit?: number
    cut_off_day?: number
    payment_day?: number
    color?: string
}

export interface BudgetFormData {
    category_id: string
    amount: number
    month: number
    year: number
}

export interface GoalFormData {
    name: string
    target_amount: number
    target_date?: Date
    color?: string
    icon?: string
}

export interface GoalContributionFormData {
    goal_id: string
    amount: number
    contribution_date: Date
    notes?: string
}

// Filter types
export interface FilterState {
    month: number
    year: number
    category_id?: string
    payment_method?: 'cash' | 'card' | 'all'
    credit_card_id?: string
    search?: string
}
