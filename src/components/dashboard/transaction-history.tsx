import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDataStore } from '@/store/data-store'
import { useUIStore } from '@/store/ui-store'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Search, Filter, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function TransactionHistory() {
    const { expenses, deleteExpense } = useDataStore()
    const { openModal } = useUIStore()
    const [filterCategory, setFilterCategory] = useState<string>('all')

    const filteredExpenses = expenses
        .filter(e => filterCategory === 'all' || e.category_id === filterCategory)
        .slice(0, 5)

    const categories = Array.from(new Set(expenses.map(e => e.category).filter(Boolean))) as any[]

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-bold text-primary-dark">Transaction History</CardTitle>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                <Filter className="h-3.5 w-3.5" />
                                {filterCategory === 'all' ? 'Filtrar' : 'Filtrado'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filtrar por categoría</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setFilterCategory('all')}>
                                Todas
                            </DropdownMenuItem>
                            {categories.map((cat) => (
                                <DropdownMenuItem key={cat.id} onClick={() => setFilterCategory(cat.id)}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                        {cat.name}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                                <th className="pb-3 px-2">Name</th>
                                <th className="pb-3 px-2">Category</th>
                                <th className="pb-3 px-2">Date</th>
                                <th className="pb-3 px-2 text-right">Amount</th>
                                <th className="pb-3 px-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredExpenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="py-4 px-2">
                                        <span className="font-medium text-primary-dark">{expense.name}</span>
                                    </td>
                                    <td className="py-4 px-2">
                                        <Badge
                                            style={{ backgroundColor: expense.category?.color || '#cbd5e1' }}
                                            className="text-white whitespace-nowrap"
                                        >
                                            {expense.category?.name || 'Uncategorized'}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-2 text-sm text-muted-foreground whitespace-nowrap">
                                        {formatDate(expense.expense_date)}
                                    </td>
                                    <td className="py-4 px-2 text-right font-bold text-danger whitespace-nowrap">
                                        -{formatCurrency(expense.amount)}
                                    </td>
                                    <td className="py-4 px-2 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openModal('expense', { id: expense.id })}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-danger" onClick={() => deleteExpense(expense.id)}>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            {filteredExpenses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                        No recent transactions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
