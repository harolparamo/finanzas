'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useDataStore } from '@/store/data-store'
import { useUIStore } from '@/store/ui-store'
import { formatCurrency } from '@/lib/formatters'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Plus } from 'lucide-react'
import React from 'react'

export function SavingsPanel() {
    const { goals } = useDataStore()
    const { openModal } = useUIStore()

    const activeGoals = goals.filter(g => !g.is_completed).slice(0, 3)
    const totalSavings = goals.reduce((sum, g) => sum + g.current_amount, 0)
    const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0)

    const chartData = goals.length > 0
        ? goals.map(g => ({ name: g.name, value: g.current_amount, color: g.color }))
        : [{ name: 'Empty', value: 1, color: '#e2e8f0' }]

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-primary-dark">Savings State</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => openModal('goal')}>
                    <Plus className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Chart */}
                <div className="h-[200px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-primary-dark">
                            {Math.round((totalSavings / (totalTarget || 1)) * 100)}%
                        </span>
                        <span className="text-xs text-muted-foreground uppercase">of target</span>
                    </div>
                </div>

                {/* Goals List */}
                <div className="space-y-4">
                    {activeGoals.map((goal) => (
                        <div key={goal.id} className="space-y-1">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">{goal.name}</span>
                                <span className="text-muted-foreground">{formatCurrency(goal.current_amount)}</span>
                            </div>
                            <Progress
                                value={(goal.current_amount / goal.target_amount) * 100}
                                className="h-2"
                                style={{ '--progress-color': goal.color } as React.CSSProperties}
                            />
                        </div>
                    ))}
                    {goals.length === 0 && (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                            No goals set yet
                        </div>
                    )}
                </div>

                <Button className="w-full" variant="outline" onClick={() => openModal('goal')}>
                    View all goals
                </Button>
            </CardContent>
        </Card>
    )
}
