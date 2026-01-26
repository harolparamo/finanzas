'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDataStore } from '@/store/data-store'
import { useUIStore } from '@/store/ui-store'
import { useFilterStore } from '@/store/filter-store'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Plus, Search, Filter, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function ExpensesPage() {
    const { expenses, deleteExpense, categories } = useDataStore()
    const { openModal } = useUIStore()
    const { category_id, payment_method, globalSearch, setCategory, setPaymentMethod, setGlobalSearch, resetFilters } = useFilterStore()

    const [showFilters, setShowFilters] = useState(false)

    // Filter expenses
    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            // Search filter
            if (globalSearch && !expense.name.toLowerCase().includes(globalSearch.toLowerCase())) {
                return false
            }
            // Category filter
            if (category_id && expense.category_id !== category_id) {
                return false
            }
            // Payment method filter
            if (payment_method && payment_method !== 'all' && expense.payment_method !== payment_method) {
                return false
            }
            return true
        })
    }, [expenses, globalSearch, category_id, payment_method])

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
    const hasActiveFilters = category_id || (payment_method && payment_method !== 'all') || globalSearch

    const handleClearFilters = () => {
        setGlobalSearch('')
        resetFilters()
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-dark">Gastos</h1>
                    <p className="text-muted-foreground">Gestiona tus gastos mensuales</p>
                </div>
                <Button className="gap-2" onClick={() => openModal('expense')}>
                    <Plus className="h-4 w-4" />
                    Nuevo Gasto
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">
                        {hasActiveFilters ? 'Total Filtrado' : 'Total del Mes'}
                    </p>
                    <p className="text-2xl font-bold text-danger">{formatCurrency(totalExpenses)}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Transacciones</p>
                    <p className="text-2xl font-bold text-primary-dark">{filteredExpenses.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Promedio/Transacción</p>
                    <p className="text-2xl font-bold text-primary-dark">
                        {filteredExpenses.length > 0 ? formatCurrency(totalExpenses / filteredExpenses.length) : '$0'}
                    </p>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <CardTitle>Lista de Gastos</CardTitle>
                            {hasActiveFilters && (
                                <Badge variant="secondary" className="gap-1">
                                    Filtrado
                                    <button onClick={handleClearFilters} className="ml-1 hover:text-danger">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar..."
                                    className="pl-9 w-48 h-9"
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                />
                            </div>
                            <Button
                                variant={showFilters ? "default" : "outline"}
                                size="sm"
                                className="h-9"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filtrar
                            </Button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Category Filter */}
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Categoría</label>
                                    <Select
                                        value={category_id || 'all'}
                                        onValueChange={(v) => setCategory(v === 'all' ? undefined : v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todas las categorías" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las categorías</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    <span className="flex items-center gap-2">
                                                        <span
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: cat.color }}
                                                        />
                                                        {cat.name}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Payment Method Filter */}
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Método de Pago</label>
                                    <Select
                                        value={payment_method || 'all'}
                                        onValueChange={(v) => setPaymentMethod(v as 'all' | 'cash' | 'card')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos los métodos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los métodos</SelectItem>
                                            <SelectItem value="cash">Efectivo</SelectItem>
                                            <SelectItem value="card">Tarjeta de Crédito</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Clear Filters Button */}
                                <div className="flex items-end">
                                    <Button variant="ghost" onClick={handleClearFilters} className="w-full sm:w-auto">
                                        <X className="h-4 w-4 mr-2" />
                                        Limpiar Filtros
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Nombre</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Categoría</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Fecha</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Método</th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Monto</th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="border-b border-border/50 hover:bg-muted/30">
                                        <td className="py-3 px-4">
                                            <span className="font-medium">{expense.name}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge
                                                style={{ backgroundColor: expense.category?.color || '#cbd5e1' }}
                                                className="text-white"
                                            >
                                                {expense.category?.name || 'Sin categoría'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">
                                            {formatDate(expense.expense_date)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <Badge variant={expense.payment_method === 'card' ? 'secondary' : 'outline'}>
                                                    {expense.payment_method === 'card' ? 'Tarjeta' : 'Efectivo'}
                                                </Badge>
                                                {expense.payment_method === 'card' && expense.credit_card && (
                                                    <span className="text-[10px] text-muted-foreground mt-1 truncate max-w-[100px]">
                                                        {expense.credit_card.bank_name || 'Banco'}
                                                        {expense.credit_card.last_four_digits && ` ••••${expense.credit_card.last_four_digits}`}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-danger">
                                            -{formatCurrency(expense.amount)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openModal('expense', { id: expense.id })}>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-danger" onClick={() => deleteExpense(expense.id)}>
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {filteredExpenses.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            {hasActiveFilters
                                                ? 'No se encontraron gastos con los filtros aplicados'
                                                : 'No hay gastos registrados'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
