'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatCardNumber } from '@/lib/formatters'
import { Plus, MoreHorizontal, Pencil, Trash2, Wallet } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useDataStore } from '@/store/data-store'
import { useUIStore } from '@/store/ui-store'

export default function CardsPage() {
    const { cards, expenses, deleteCard } = useDataStore()
    const { openModal } = useUIStore()

    const getCardTotalExpenses = (cardId: string) => {
        return expenses
            .filter(e => e.credit_card_id === cardId)
            .reduce((sum, e) => sum + e.amount, 0)
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-dark">Tarjetas de Crédito</h1>
                    <p className="text-muted-foreground">Gestiona tus tarjetas y sus gastos</p>
                </div>
                <Button className="gap-2" onClick={() => openModal('card')}>
                    <Plus className="h-4 w-4" />
                    Nueva Tarjeta
                </Button>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => {
                    const totalSpent = getCardTotalExpenses(card.id)

                    return (
                        <Card key={card.id} className="overflow-hidden flex flex-col h-full">
                            {/* Card visual */}
                            <div
                                className={cn(
                                    "relative aspect-[1.6/1] p-5 text-white overflow-hidden",
                                    index % 3 === 0 && "bg-gradient-to-br from-primary-dark to-primary",
                                    index % 3 === 1 && "bg-gradient-to-br from-primary to-primary-light",
                                    index % 3 === 2 && "bg-gradient-to-br from-primary-light to-accent-dark"
                                )}
                                style={{ backgroundColor: card.color }}
                            >
                                {/* Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-4 right-4 w-32 h-32 rounded-full border border-white/30" />
                                    <div className="absolute top-8 right-8 w-24 h-24 rounded-full border border-white/20" />
                                </div>

                                <div className="relative h-full flex flex-col justify-between">
                                    <div className="flex items-start justify-between">
                                        <p className="text-sm text-white/80">{card.bank_name || 'Banco'}</p>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openModal('card', { id: card.id })}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-danger" onClick={() => deleteCard(card.id)}>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div>
                                        <p className="font-mono text-lg tracking-wider mb-2">
                                            {formatCardNumber(card.last_four_digits || '****')}
                                        </p>
                                        <div className="flex justify-between items-end">
                                            <p className="text-sm font-medium">{card.name}</p>
                                            <p className="text-xs text-white/80">
                                                Vence: {card.cut_off_day}/{new Date().getFullYear()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card details */}
                            <CardContent className="p-4 space-y-4 flex-1">
                                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Wallet className="h-4 w-4 text-primary-dark" />
                                        <span className="text-xs font-medium text-muted-foreground uppercase">Gastos Acumulados</span>
                                    </div>
                                    <p className="text-2xl font-bold text-primary-dark">
                                        {formatCurrency(totalSpent)}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Límite de crédito</span>
                                        <span className="font-medium">{formatCurrency(card.credit_limit)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Fecha de corte</span>
                                        <span className="font-medium">Día {card.cut_off_day || '--'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Fecha de pago</span>
                                        <span className="font-medium">Día {card.payment_day || '--'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {cards.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-primary-dark">
                                <Plus className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-medium text-primary-dark">No tienes tarjetas</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Agrega tu primera tarjeta de crédito para comenzar a registrar tus gastos.
                            </p>
                            <Button className="mt-4 gap-2" onClick={() => openModal('card')}>
                                <Plus className="h-4 w-4" />
                                Nueva Tarjeta
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
