'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatPercentage } from '@/lib/formatters'
import { getMockMonthlyChartData } from '@/lib/mock-data'
import { useAuthStore } from '@/store/auth-store'
import { useDataStore } from '@/store/data-store'
import { TrendingUp, BarChart2 } from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'
import { useState } from 'react'

export function TotalBalanceChart() {
    const [period, setPeriod] = useState('month')
    const { user } = useAuthStore()
    const { income, expenses } = useDataStore()

    // Only show mock data for demo user
    const isDemo = user?.email === 'demo@example.com'
    const data = isDemo ? getMockMonthlyChartData() : []

    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0)
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)
    const totalBalance = isDemo ? 9580000 : (totalIncome - totalExpenses)
    const balanceChange = isDemo ? 5 : 0

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold">Total Balance</CardTitle>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-3xl font-bold text-primary-dark">
                                {formatCurrency(totalBalance)}
                            </span>
                            {balanceChange > 0 && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    {formatPercentage(balanceChange)}
                                </div>
                            )}
                        </div>
                    </div>

                    <Tabs value={period} onValueChange={setPeriod}>
                        <TabsList className="bg-muted">
                            <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                            <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
                            <TabsTrigger value="year" className="text-xs">Year</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <div className="h-[280px]">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#1a2e1a',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '12px',
                                    }}
                                    formatter={(value: number) => [formatCurrency(value), '']}
                                    labelFormatter={(label) => `${label}`}
                                />
                                <Bar
                                    dataKey="income"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={isDemo && entry.monthNumber === 7 ? '#1a2e1a' : '#c5d4c5'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                            <BarChart2 className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">No hay datos históricos para mostrar</p>
                            <p className="text-xs">Agrega tus primeros ingresos y gastos para ver la gráfica.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
