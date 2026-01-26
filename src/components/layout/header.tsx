import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUIStore } from '@/store/ui-store'
import { useAuthStore } from '@/store/auth-store'
import { useFilterStore } from '@/store/filter-store'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState, useRef } from 'react'

const navTabs = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/expenses', label: 'Gastos' },
    { href: '/income', label: 'Ingresos' },
    { href: '/cards', label: 'Tarjetas' },
    { href: '/budgets', label: 'Presupuestos' },
    { href: '/goals', label: 'Metas' },
    { href: '/reports', label: 'Reportes' },
    { href: '/settings', label: 'Configuración' },
]

export function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const { toggleSidebar } = useUIStore()
    const { user, logout } = useAuthStore()
    const setGlobalSearch = useFilterStore((state) => state.setGlobalSearch)

    const [searchQuery, setSearchQuery] = useState('')
    const searchRef = useRef<HTMLDivElement>(null)

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface px-6">
            {/* Menu toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="shrink-0"
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Navigation tabs */}
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-[calc(100vw-200px)] lg:max-w-none">
                {navTabs.map((tab) => {
                    const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                                isActive
                                    ? "bg-primary-dark text-white"
                                    : "text-muted-foreground hover:text-primary-dark hover:bg-accent/50"
                            )}
                        >
                            {tab.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <div className="relative hidden md:block" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar gastos, ingresos..."
                    className="pl-9 w-64 bg-background border-border"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setGlobalSearch(e.target.value)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setGlobalSearch(searchQuery)
                            router.push('/expenses')
                        }
                    }}
                />
            </div>

            {/* User menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-accent text-primary-dark">
                                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">{user?.full_name || 'Usuario'}</p>
                            <p className="text-xs text-muted-foreground">{user?.email || 'email@example.com'}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/settings">Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/settings">Configuración</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-danger" onClick={() => {
                        logout()
                        router.push('/login')
                    }}>
                        Cerrar sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
