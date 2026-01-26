import { z } from 'zod'

export const expenseSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
    amount: z.number().min(0, 'El monto debe ser positivo'),
    category_id: z.string().min(1, 'Selecciona una categoría'),
    payment_method: z.enum(['cash', 'card'], {
        errorMap: () => ({ message: 'Selecciona un método de pago' }),
    }),
    credit_card_id: z.string().optional(),
    expense_date: z.date({
        required_error: 'La fecha es requerida',
    }),
    notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
    is_recurring: z.boolean().optional(),
})

export const incomeSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
    amount: z.number().min(0, 'El monto debe ser positivo'),
    income_date: z.date({
        required_error: 'La fecha es requerida',
    }),
    source: z.string().max(100, 'Máximo 100 caracteres').optional(),
    notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
    is_recurring: z.boolean().optional(),
})

export const creditCardSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
    bank_name: z.string().max(50, 'Máximo 50 caracteres').optional(),
    last_four_digits: z
        .string()
        .length(4, 'Debe tener 4 dígitos')
        .regex(/^\d{4}$/, 'Solo dígitos')
        .optional()
        .or(z.literal('')),
    credit_limit: z.number().min(0, 'El límite debe ser positivo').optional(),
    cut_off_day: z.number().min(1).max(31).optional(),
    payment_day: z.number().min(1).max(31).optional(),
    color: z.string().optional(),
})

export const budgetSchema = z.object({
    category_id: z.string().min(1, 'Selecciona una categoría'),
    amount: z.number().min(0, 'El monto debe ser positivo'),
    month: z.number().min(1).max(12),
    year: z.number().min(2020).max(2100),
})

export const goalSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
    target_amount: z.number().min(1, 'El monto objetivo debe ser mayor a 0'),
    target_date: z.date().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
})

export const goalContributionSchema = z.object({
    goal_id: z.string().min(1, 'Selecciona una meta'),
    amount: z.number().min(1, 'El monto debe ser mayor a 0'),
    contribution_date: z.date({
        required_error: 'La fecha es requerida',
    }),
    notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z.object({
    full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
export type IncomeFormValues = z.infer<typeof incomeSchema>
export type CreditCardFormValues = z.infer<typeof creditCardSchema>
export type BudgetFormValues = z.infer<typeof budgetSchema>
export type GoalFormValues = z.infer<typeof goalSchema>
export type GoalContributionFormValues = z.infer<typeof goalContributionSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
