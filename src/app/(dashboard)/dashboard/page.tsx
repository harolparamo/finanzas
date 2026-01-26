'use client'

import { SummaryCards } from '@/components/dashboard/summary-cards'
import { TotalBalanceChart } from '@/components/dashboard/total-balance-chart'
import { SavingsPanel } from '@/components/dashboard/savings-panel'
import { CardsPanel } from '@/components/dashboard/cards-panel'
import { TransactionHistory } from '@/components/dashboard/transaction-history'

export default function DashboardPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Grid layout matching reference design */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6">
                {/* Main content */}
                <div className="space-y-6">
                    {/* Summary cards */}
                    <SummaryCards />

                    {/* Balance chart */}
                    <TotalBalanceChart />

                    {/* Transaction history */}
                    <TransactionHistory />
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    {/* Savings panel */}
                    <SavingsPanel />

                    {/* Cards panel */}
                    <CardsPanel />
                </div>
            </div>
        </div>
    )
}
