// Mock data for development without Supabase connection
import {
    Profile, Category, CreditCard, Expense, Income,
    Budget, Goal, GoalContribution, MonthlySummary, MonthlyChartData
} from '@/types/database'

const MOCK_USER_ID = 'mock-user-001'

export const mockProfile: Profile = {
    id: MOCK_USER_ID,
    email: 'demo@example.com',
    full_name: 'Usuario Demo',
    avatar_url: null,
    currency: 'COP',
    timezone: 'America/Bogota',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
}

export const mockCategories: Category[] = [
    { id: 'cat-1', user_id: MOCK_USER_ID, name: 'Domicilios', icon: 'home', color: '#ef4444', is_default: true, sort_order: 1, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 'cat-2', user_id: MOCK_USER_ID, name: 'Mercado', icon: 'shopping-cart', color: '#f97316', is_default: true, sort_order: 2, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 'cat-3', user_id: MOCK_USER_ID, name: 'Créditos', icon: 'credit-card', color: '#eab308', is_default: true, sort_order: 3, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 'cat-4', user_id: MOCK_USER_ID, name: 'Tools', icon: 'wrench', color: '#84cc16', is_default: true, sort_order: 4, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 'cat-5', user_id: MOCK_USER_ID, name: 'Streaming', icon: 'tv', color: '#22c55e', is_default: true, sort_order: 5, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 'cat-6', user_id: MOCK_USER_ID, name: 'Entretenimiento', icon: 'gamepad-2', color: '#14b8a6', is_default: true, sort_order: 6, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 'cat-7', user_id: MOCK_USER_ID, name: 'Hogar', icon: 'house', color: '#06b6d4', is_default: true, sort_order: 7, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 'cat-8', user_id: MOCK_USER_ID, name: 'Familia', icon: 'users', color: '#3b82f6', is_default: true, sort_order: 8, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 'cat-9', user_id: MOCK_USER_ID, name: 'Salud', icon: 'heart-pulse', color: '#8b5cf6', is_default: true, sort_order: 9, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 'cat-10', user_id: MOCK_USER_ID, name: 'Viajes', icon: 'plane', color: '#ec4899', is_default: true, sort_order: 10, created_at: '2024-01-01', updated_at: '2024-01-01' },
]

export const mockCreditCards: CreditCard[] = [
    {
        id: 'card-1',
        user_id: MOCK_USER_ID,
        name: 'Visa Gold',
        last_four_digits: '7628',
        bank_name: 'Bank of America',
        credit_limit: 15000000,
        cut_off_day: 15,
        payment_day: 5,
        color: '#1a2e1a',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: 'card-2',
        user_id: MOCK_USER_ID,
        name: 'Mastercard Platinum',
        last_four_digits: '4521',
        bank_name: 'Bank of Alaska',
        credit_limit: 20000000,
        cut_off_day: 20,
        payment_day: 10,
        color: '#2d4a2d',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: 'card-3',
        user_id: MOCK_USER_ID,
        name: 'American Express',
        last_four_digits: '9834',
        bank_name: 'Bank of Merina',
        credit_limit: 25000000,
        cut_off_day: 25,
        payment_day: 15,
        color: '#4a7c4a',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
]

export const mockExpenses: Expense[] = [
    { id: 'exp-1', user_id: MOCK_USER_ID, category_id: 'cat-1', credit_card_id: null, name: 'Rappi - Almuerzo', amount: 45000, payment_method: 'cash', expense_date: '2025-01-20', month: 1, year: 2025, notes: null, is_recurring: false, created_at: '2025-01-20', updated_at: '2025-01-20', category: mockCategories[0] },
    { id: 'exp-2', user_id: MOCK_USER_ID, category_id: 'cat-2', credit_card_id: null, name: 'Éxito - Mercado semanal', amount: 280000, payment_method: 'cash', expense_date: '2025-01-18', month: 1, year: 2025, notes: 'Mercado de la semana', is_recurring: false, created_at: '2025-01-18', updated_at: '2025-01-18', category: mockCategories[1] },
    { id: 'exp-3', user_id: MOCK_USER_ID, category_id: 'cat-5', credit_card_id: 'card-1', name: 'Netflix', amount: 44900, payment_method: 'card', expense_date: '2025-01-15', month: 1, year: 2025, notes: 'Plan Premium', is_recurring: true, created_at: '2025-01-15', updated_at: '2025-01-15', category: mockCategories[4], credit_card: mockCreditCards[0] },
    { id: 'exp-4', user_id: MOCK_USER_ID, category_id: 'cat-5', credit_card_id: 'card-1', name: 'Spotify', amount: 29900, payment_method: 'card', expense_date: '2025-01-15', month: 1, year: 2025, notes: 'Plan Individual', is_recurring: true, created_at: '2025-01-15', updated_at: '2025-01-15', category: mockCategories[4], credit_card: mockCreditCards[0] },
    { id: 'exp-5', user_id: MOCK_USER_ID, category_id: 'cat-7', credit_card_id: null, name: 'Servicios públicos', amount: 180000, payment_method: 'cash', expense_date: '2025-01-10', month: 1, year: 2025, notes: 'Agua, luz, gas', is_recurring: true, created_at: '2025-01-10', updated_at: '2025-01-10', category: mockCategories[6] },
    { id: 'exp-6', user_id: MOCK_USER_ID, category_id: 'cat-6', credit_card_id: 'card-2', name: 'Amazon - Compra online', amount: 750000, payment_method: 'card', expense_date: '2025-01-03', month: 1, year: 2025, notes: 'Accesorios tecnología', is_recurring: false, created_at: '2025-01-03', updated_at: '2025-01-03', category: mockCategories[5], credit_card: mockCreditCards[1] },
    { id: 'exp-7', user_id: MOCK_USER_ID, category_id: 'cat-9', credit_card_id: null, name: 'Farmacia', amount: 85000, payment_method: 'cash', expense_date: '2025-01-08', month: 1, year: 2025, notes: 'Medicamentos', is_recurring: false, created_at: '2025-01-08', updated_at: '2025-01-08', category: mockCategories[8] },
    { id: 'exp-8', user_id: MOCK_USER_ID, category_id: 'cat-3', credit_card_id: 'card-1', name: 'Cuota carro', amount: 850000, payment_method: 'card', expense_date: '2025-01-05', month: 1, year: 2025, notes: 'Cuota 12 de 48', is_recurring: true, created_at: '2025-01-05', updated_at: '2025-01-05', category: mockCategories[2], credit_card: mockCreditCards[0] },
]

export const mockIncome: Income[] = [
    { id: 'inc-1', user_id: MOCK_USER_ID, name: 'Salario', amount: 8500000, income_date: '2025-01-01', month: 1, year: 2025, source: 'Empresa XYZ', notes: 'Salario mensual', is_recurring: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
    { id: 'inc-2', user_id: MOCK_USER_ID, name: 'Freelance - Proyecto web', amount: 1500000, income_date: '2025-01-15', month: 1, year: 2025, source: 'Cliente ABC', notes: 'Desarrollo landing page', is_recurring: false, created_at: '2025-01-15', updated_at: '2025-01-15' },
    { id: 'inc-3', user_id: MOCK_USER_ID, name: 'Dividendos', amount: 320000, income_date: '2025-01-20', month: 1, year: 2025, source: 'Inversiones', notes: 'Rendimientos del mes', is_recurring: false, created_at: '2025-01-20', updated_at: '2025-01-20' },
]

export const mockBudgets: Budget[] = [
    { id: 'bud-1', user_id: MOCK_USER_ID, category_id: 'cat-1', amount: 200000, month: 1, year: 2025, created_at: '2025-01-01', updated_at: '2025-01-01', category: mockCategories[0] },
    { id: 'bud-2', user_id: MOCK_USER_ID, category_id: 'cat-2', amount: 800000, month: 1, year: 2025, created_at: '2025-01-01', updated_at: '2025-01-01', category: mockCategories[1] },
    { id: 'bud-3', user_id: MOCK_USER_ID, category_id: 'cat-5', amount: 150000, month: 1, year: 2025, created_at: '2025-01-01', updated_at: '2025-01-01', category: mockCategories[4] },
    { id: 'bud-4', user_id: MOCK_USER_ID, category_id: 'cat-6', amount: 500000, month: 1, year: 2025, created_at: '2025-01-01', updated_at: '2025-01-01', category: mockCategories[5] },
    { id: 'bud-5', user_id: MOCK_USER_ID, category_id: 'cat-7', amount: 300000, month: 1, year: 2025, created_at: '2025-01-01', updated_at: '2025-01-01', category: mockCategories[6] },
]

export const mockGoals: Goal[] = [
    { id: 'goal-1', user_id: MOCK_USER_ID, name: 'Home', target_amount: 20000000, current_amount: 15000000, target_date: '2025-12-31', color: '#ef4444', icon: 'home', is_completed: false, completed_at: null, created_at: '2024-01-01', updated_at: '2025-01-15' },
    { id: 'goal-2', user_id: MOCK_USER_ID, name: 'Emergency Fund', target_amount: 15000000, current_amount: 7500000, target_date: '2025-06-30', color: '#f97316', icon: 'shield', is_completed: false, completed_at: null, created_at: '2024-01-01', updated_at: '2025-01-10' },
    { id: 'goal-3', user_id: MOCK_USER_ID, name: 'Vacation', target_amount: 5000000, current_amount: 2000000, target_date: '2025-07-01', color: '#22c55e', icon: 'plane', is_completed: false, completed_at: null, created_at: '2024-06-01', updated_at: '2025-01-05' },
]

export const mockGoalContributions: GoalContribution[] = [
    { id: 'cont-1', user_id: MOCK_USER_ID, goal_id: 'goal-1', amount: 1000000, contribution_date: '2025-01-15', notes: 'Aporte mensual', created_at: '2025-01-15' },
    { id: 'cont-2', user_id: MOCK_USER_ID, goal_id: 'goal-2', amount: 500000, contribution_date: '2025-01-10', notes: 'Aporte quincenal', created_at: '2025-01-10' },
    { id: 'cont-3', user_id: MOCK_USER_ID, goal_id: 'goal-3', amount: 300000, contribution_date: '2025-01-05', notes: null, created_at: '2025-01-05' },
]

export function getMockMonthlySummary(): MonthlySummary {
    const totalIncome = mockIncome.reduce((sum, inc) => sum + inc.amount, 0)
    const totalExpenses = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0)

    return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        totalBudget: mockBudgets.reduce((sum, b) => sum + b.amount, 0),
        budgetRemaining: mockBudgets.reduce((sum, b) => sum + b.amount, 0) - totalExpenses,
        incomeChange: 40, // +40% vs last month
        expenseChange: -5, // -5% vs last month
    }
}

export function getMockMonthlyChartData(): MonthlyChartData[] {
    return [
        { month: 'Ene', monthNumber: 1, income: 7200000, expenses: 4800000, balance: 2400000 },
        { month: 'Feb', monthNumber: 2, income: 7500000, expenses: 5200000, balance: 2300000 },
        { month: 'Mar', monthNumber: 3, income: 7100000, expenses: 4900000, balance: 2200000 },
        { month: 'Abr', monthNumber: 4, income: 7800000, expenses: 5500000, balance: 2300000 },
        { month: 'May', monthNumber: 5, income: 8200000, expenses: 5800000, balance: 2400000 },
        { month: 'Jun', monthNumber: 6, income: 8500000, expenses: 6200000, balance: 2300000 },
        { month: 'Jul', monthNumber: 7, income: 9680000, expenses: 7500000, balance: 2180000 },
        { month: 'Ago', monthNumber: 8, income: 8800000, expenses: 6100000, balance: 2700000 },
        { month: 'Sep', monthNumber: 9, income: 8400000, expenses: 5900000, balance: 2500000 },
        { month: 'Oct', monthNumber: 10, income: 8600000, expenses: 6000000, balance: 2600000 },
        { month: 'Nov', monthNumber: 11, income: 8900000, expenses: 6300000, balance: 2600000 },
        { month: 'Dic', monthNumber: 12, income: 9200000, expenses: 7000000, balance: 2200000 },
    ]
}

export function getTotalSavings(): number {
    return mockGoals.reduce((sum, g) => sum + g.current_amount, 0)
}
