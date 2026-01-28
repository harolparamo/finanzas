'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataStore } from '@/store/data-store'
import { useAuthStore } from '@/store/auth-store'
import { formatCurrency, formatPercentage } from '@/lib/formatters'
import { ArrowDownRight, Wallet, TrendingUp } from 'lucide-react'

export function SummaryCards() {
    const { income, expenses, goals } = useDataStore()
    const { user } = useAuthStore()

    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalSavings = goals.reduce((sum, g) => sum + g.current_amount, 0)

    // Only show changes for the demo user for visual effect
    const isDemo = user?.email === 'demo@example.com'
    const incomeChange = isDemo ? 40 : 0
    const expenseChange = isDemo ? 5 : 0
    const savingsChange = isDemo ? 12 : 0

    const cards = [
        {
            title: 'Income',
            value: totalIncome,
            change: incomeChange,
            icon: <Wallet className="h-4 w-4 text-success" />,
            color: 'text-success',
        },
        {
            title: 'Expenses',
            value: totalExpenses,
            change: expenseChange,
            icon: <ArrowDownRight className="h-4 w-4 text-danger" />,
            color: 'text-danger',
        },
        {
            title: 'Savings',
            value: totalSavings,
            change: savingsChange,
            icon: <TrendingUp className="h-4 w-4 text-primary" />,
            color: 'text-primary',
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
                <Card key={card.title} className="card-hover">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                            {card.title}
                        </CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                            {card.icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary-dark">
                            {formatCurrency(card.value)}
                        </div>
                        {card.change > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success flex items-center gap-1`}>
                                    <TrendingUp className="h-3 w-3" />
                                    {formatPercentage(card.change)}
                                </span>
                                <span className="text-xs text-muted-foreground">Than last month</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
