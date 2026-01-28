'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Receipt,
    Wallet,
    CreditCard,
    Target,
    PiggyBank,
    BarChart3,
    Settings,
    LogOut
} from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { useAuthStore } from '@/store/auth-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/expenses', icon: Receipt, label: 'Gastos' },
    { href: '/income', icon: Wallet, label: 'Ingresos' },
    { href: '/cards', icon: CreditCard, label: 'Tarjetas' },
    { href: '/budgets', icon: PiggyBank, label: 'Presupuestos' },
    { href: '/goals', icon: Target, label: 'Metas' },
    { href: '/reports', icon: BarChart3, label: 'Reportes' },
]

const bottomNavItems = [
    { href: '/settings', icon: Settings, label: 'Configuración' },
]

export function Sidebar() {
    const pathname = usePathname()
    const { sidebarOpen } = useUIStore()
    const { user } = useAuthStore()

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen bg-primary-dark transition-all duration-300 flex flex-col",
                sidebarOpen ? "w-64" : "w-20"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b border-primary/30">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                        <span className="text-lg font-bold text-primary-dark">₱</span>
                    </div>
                    {sidebarOpen && (
                        <span className="text-lg font-semibold text-white animate-fade-in">
                            Finanzas
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        const Icon = item.icon

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-accent text-primary-dark"
                                            : "text-white/70 hover:bg-primary hover:text-white"
                                    )}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {sidebarOpen && (
                                        <span className="animate-fade-in">{item.label}</span>
                                    )}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Bottom navigation */}
            <div className="border-t border-primary/30 p-3">
                <ul className="space-y-1">
                    {bottomNavItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-accent text-primary-dark"
                                            : "text-white/70 hover:bg-primary hover:text-white"
                                    )}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {sidebarOpen && (
                                        <span className="animate-fade-in">{item.label}</span>
                                    )}
                                </Link>
                            </li>
                        )
                    })}
                    <li>
                        <button
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-primary hover:text-white"
                        >
                            <LogOut className="h-5 w-5 shrink-0" />
                            {sidebarOpen && (
                                <span className="animate-fade-in">Cerrar sesión</span>
                            )}
                        </button>
                    </li>
                </ul>

                {/* User */}
                {sidebarOpen && user && (
                    <div className="mt-4 flex items-center gap-3 rounded-lg bg-primary/50 p-3 animate-fade-in">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-accent text-primary-dark text-sm">
                                {user.full_name?.substring(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.full_name || 'Usuario'}</p>
                            <p className="text-xs text-white/60 truncate">{user.email}</p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    )
}
