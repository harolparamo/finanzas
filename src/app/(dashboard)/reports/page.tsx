'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataStore } from '@/store/data-store'
import { formatCurrency } from '@/lib/formatters'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import { useMemo } from 'react'

export default function ReportsPage() {
    const { expenses, income, budgets, categories } = useDataStore()

    // Monthly summary calculation
    const summary = useMemo(() => {
        const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0)
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
        const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)

        return {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            totalBudget,
            budgetRemaining: totalBudget - totalExpenses
        }
    }, [income, expenses, budgets])

    // Category breakdown calculation
    const pieData = useMemo(() => {
        const categoryTotals = expenses.reduce((acc, exp) => {
            const category = categories.find(c => c.id === exp.category_id)
            if (category) {
                acc[category.name] = (acc[category.name] || { value: 0, color: category.color })
                acc[category.name].value += exp.amount
            }
            return acc
        }, {} as Record<string, { value: number; color: string }>)

        return Object.entries(categoryTotals).map(([name, data]) => ({
            name,
            value: data.value,
            color: data.color,
        }))
    }, [expenses, categories])

    // Mock trend data for now (or could be calculated from expenses/income by month)
    const monthlyData = [
        { month: 'Ene', income: summary.totalIncome, expenses: summary.totalExpenses },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary-dark">Reportes</h1>
                <p className="text-muted-foreground">Análisis detallado de tus finanzas</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Ingresos</p>
                    <p className="text-2xl font-bold text-success">{formatCurrency(summary.totalIncome)}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Gastos</p>
                    <p className="text-2xl font-bold text-danger">{formatCurrency(summary.totalExpenses)}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold text-primary-dark">{formatCurrency(summary.balance)}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Tasa de Ahorro</p>
                    <p className="text-2xl font-bold text-primary-dark">
                        {Math.round((summary.balance / summary.totalIncome) * 100)}%
                    </p>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tendencia Mensual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                                    />
                                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Ingresos" />
                                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Gastos" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Category breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gastos por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={true}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
