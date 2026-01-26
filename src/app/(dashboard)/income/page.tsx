'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDataStore } from '@/store/data-store'
import { useUIStore } from '@/store/ui-store'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Wallet } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function IncomePage() {
    const { income, deleteIncome } = useDataStore()
    const { openModal } = useUIStore()

    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0)

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-dark">Ingresos</h1>
                    <p className="text-muted-foreground">Gestiona tus fuentes de ingreso</p>
                </div>
                <Button className="gap-2" onClick={() => openModal('income')}>
                    <Plus className="h-4 w-4" />
                    Nuevo Ingreso
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total del Mes</p>
                    <p className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Fuentes de Ingreso</p>
                    <p className="text-2xl font-bold text-primary-dark">{income.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Ingreso Recurrente</p>
                    <p className="text-2xl font-bold text-primary-dark">
                        {formatCurrency(income.filter(i => i.is_recurring).reduce((s, i) => s + i.amount, 0))}
                    </p>
                </Card>
            </div>

            {/* Income list */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle>Lista de Ingresos</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Buscar..." className="pl-9 w-48 h-9" />
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="space-y-3">
                        {income.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                        <Wallet className="h-5 w-5 text-success" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.source}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-bold text-success">+{formatCurrency(item.amount)}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(item.income_date)}</p>
                                    </div>
                                    {item.is_recurring && (
                                        <Badge variant="secondary">Recurrente</Badge>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openModal('income', { id: item.id })}>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-danger" onClick={() => deleteIncome(item.id)}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
