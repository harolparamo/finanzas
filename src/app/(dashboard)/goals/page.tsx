'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useDataStore } from '@/store/data-store'
import { useUIStore } from '@/store/ui-store'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Plus, Target, MoreHorizontal, Pencil, Trash2, DollarSign } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function GoalsPage() {
    const { goals, deleteGoal } = useDataStore()
    const { openModal } = useUIStore()

    const totalSavings = goals.reduce((sum, g) => sum + g.current_amount, 0)

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-dark">Metas de Ahorro</h1>
                    <p className="text-muted-foreground">Establece y alcanza tus objetivos financieros</p>
                </div>
                <Button className="gap-2" onClick={() => openModal('goal')}>
                    <Plus className="h-4 w-4" />
                    Nueva Meta
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Ahorrado</p>
                    <p className="text-2xl font-bold text-success">{formatCurrency(totalSavings)}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Metas Activas</p>
                    <p className="text-2xl font-bold text-primary-dark">{goals.filter(g => !g.is_completed).length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Meta Total</p>
                    <p className="text-2xl font-bold text-primary-dark">
                        {formatCurrency(goals.reduce((s, g) => s + g.target_amount, 0))}
                    </p>
                </Card>
            </div>

            {/* Goals grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                    const percentage = Math.round((goal.current_amount / goal.target_amount) * 100)

                    return (
                        <Card key={goal.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${goal.color}20` }}
                                        >
                                            <Target className="h-5 w-5" style={{ color: goal.color }} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{goal.name}</CardTitle>
                                            {goal.target_date && (
                                                <p className="text-xs text-muted-foreground">
                                                    Meta: {formatDate(goal.target_date)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openModal('contribution', { id: goal.id })}>
                                                <DollarSign className="h-4 w-4 mr-2" />
                                                Agregar Aporte
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openModal('goal', { id: goal.id })}>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-danger" onClick={() => deleteGoal(goal.id)}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-2xl font-bold" style={{ color: goal.color }}>
                                            {formatCurrency(goal.current_amount)}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            de {formatCurrency(goal.target_amount)}
                                        </span>
                                    </div>
                                    <Progress
                                        value={percentage}
                                        className="h-3"
                                        indicatorClassName={`bg-[${goal.color}]`}
                                        style={{ '--progress-color': goal.color } as React.CSSProperties}
                                    />
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {percentage}% completado
                                    </p>
                                </div>

                                <Button variant="outline" className="w-full" onClick={() => openModal('contribution', { id: goal.id })}>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Agregar Aporte
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
                {goals.length === 0 && (
                    <div className="col-span-full py-8 text-center text-muted-foreground">
                        No hay metas establecidas
                    </div>
                )}
            </div>
        </div>
    )
}
