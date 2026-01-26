'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useDataStore } from '@/store/data-store'
import { useUIStore } from '@/store/ui-store'
import { formatCurrency } from '@/lib/formatters'
import { Plus, AlertTriangle, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function BudgetsPage() {
    const { budgets, expenses, deleteBudget } = useDataStore()
    const { openModal } = useUIStore()

    // Calculate spent per category
    const categorySpending = expenses.reduce((acc, exp) => {
        if (exp.category_id) {
            acc[exp.category_id] = (acc[exp.category_id] || 0) + exp.amount
        }
        return acc
    }, {} as Record<string, number>)

    const budgetsWithSpent = budgets.map(budget => ({
        ...budget,
        spent: categorySpending[budget.category_id] || 0,
        percentage: Math.round(((categorySpending[budget.category_id] || 0) / budget.amount) * 100)
    }))

    const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
    const totalSpent = budgets.reduce((s, b) => s + (categorySpending[b.category_id] || 0), 0)

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-dark">Presupuestos</h1>
                    <p className="text-muted-foreground">Establece límites de gasto por categoría</p>
                </div>
                <Button className="gap-2" onClick={() => openModal('budget')}>
                    <Plus className="h-4 w-4" />
                    Nuevo Presupuesto
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Presupuesto Total</p>
                    <p className="text-2xl font-bold text-primary-dark">{formatCurrency(totalBudget)}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Gastado</p>
                    <p className="text-2xl font-bold text-danger">{formatCurrency(totalSpent)}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Disponible</p>
                    <p className={cn(
                        "text-2xl font-bold",
                        totalBudget - totalSpent >= 0 ? "text-success" : "text-danger"
                    )}>
                        {formatCurrency(Math.max(0, totalBudget - totalSpent))}
                    </p>
                </Card>
            </div>

            {/* Budgets list */}
            <Card>
                <CardHeader>
                    <CardTitle>Presupuestos por Categoría</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {budgetsWithSpent.map((budget) => {
                        const isOverBudget = budget.percentage > 100
                        const isNearLimit = budget.percentage >= 80 && budget.percentage <= 100

                        return (
                            <div key={budget.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: budget.category?.color || '#cbd5e1' }}
                                        />
                                        <span className="font-medium">{budget.category?.name || 'Desconocida'}</span>
                                        {isOverBudget && (
                                            <span className="flex items-center gap-1 text-xs text-danger">
                                                <AlertTriangle className="h-3 w-3" />
                                                Excedido
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className={cn(
                                                "font-medium",
                                                isOverBudget ? "text-danger" : "text-muted-foreground"
                                            )}>
                                                {formatCurrency(budget.spent)}
                                            </span>
                                            <span className="text-muted-foreground"> / {formatCurrency(budget.amount)}</span>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openModal('budget', { id: budget.id })}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-danger" onClick={() => deleteBudget(budget.id)}>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Progress
                                        value={Math.min(100, budget.percentage)}
                                        className="h-2 flex-1"
                                        indicatorClassName={cn(
                                            isOverBudget && "bg-danger",
                                            isNearLimit && "bg-warning",
                                            !isOverBudget && !isNearLimit && "bg-success"
                                        )}
                                    />
                                    <span className={cn(
                                        "text-sm font-medium w-12 text-right",
                                        isOverBudget && "text-danger",
                                        isNearLimit && "text-warning"
                                    )}>
                                        {budget.percentage}%
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                    {budgetsWithSpent.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground">
                            No hay presupuestos establecidos
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
