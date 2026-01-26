'use client'

import React from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useUIStore } from '@/store/ui-store'
import { useDataStore } from '@/store/data-store'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { IncomeForm } from '@/components/income/income-form'
import { BudgetForm } from '@/components/budgets/budget-form'
import { GoalForm } from '@/components/goals/goal-form'
import { ContributionForm } from '@/components/goals/contribution-form'
import { CardForm } from '@/components/cards/card-form'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { sidebarOpen, activeModal, modalData, closeModal } = useUIStore()
    const { fetchData } = useDataStore()
    const { checkSession } = useAuthStore()

    React.useEffect(() => {
        const init = async () => {
            await checkSession()
            await fetchData()
        }
        init()
    }, [checkSession, fetchData])

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar />
            <div
                className={cn(
                    "transition-all duration-300",
                    sidebarOpen ? "ml-64" : "ml-20"
                )}
            >
                <Header />
                <main className="p-6">
                    {children}
                </main>
            </div>

            {/* Global Modals */}
            <Dialog open={activeModal !== null} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {activeModal === 'expense' && (modalData?.id ? 'Editar Gasto' : 'Nuevo Gasto')}
                            {activeModal === 'income' && (modalData?.id ? 'Editar Ingreso' : 'Nuevo Ingreso')}
                            {activeModal === 'budget' && (modalData?.id ? 'Editar Presupuesto' : 'Nuevo Presupuesto')}
                            {activeModal === 'goal' && (modalData?.id ? 'Editar Meta' : 'Nueva Meta')}
                            {activeModal === 'contribution' && ('Agregar Aporte')}
                        </DialogTitle>
                    </DialogHeader>

                    {activeModal === 'expense' && <ExpenseForm id={modalData?.id as string} />}
                    {activeModal === 'income' && <IncomeForm id={modalData?.id as string} />}
                    {activeModal === 'budget' && <BudgetForm id={modalData?.id as string} />}
                    {activeModal === 'goal' && <GoalForm id={modalData?.id as string} />}
                    {activeModal === 'contribution' && <ContributionForm goalId={modalData?.id as string} />}
                    {activeModal === 'card' && <CardForm id={modalData?.id as string} />}
                </DialogContent>
            </Dialog>
        </div>
    )
}
