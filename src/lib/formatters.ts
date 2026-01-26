import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Format a number as Colombian Peso currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat('es-CO').format(value)
}

/**
 * Format a date as DD/MM/YYYY
 */
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'dd/MM/yyyy')
}

/**
 * Format a date with month name
 */
export function formatDateLong(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, "d 'de' MMMM, yyyy", { locale: es })
}

/**
 * Format month name
 */
export function formatMonth(month: number): string {
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return monthNames[month - 1] || ''
}

/**
 * Format month name (short)
 */
export function formatMonthShort(month: number): string {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return monthNames[month - 1] || ''
}

/**
 * Format percentage with sign
 */
export function formatPercentage(value: number, showSign: boolean = true): string {
    const sign = showSign && value > 0 ? '+' : ''
    return `${sign}${value.toFixed(0)}%`
}

/**
 * Format credit card number (masked)
 */
export function formatCardNumber(lastFour: string | null): string {
    if (!lastFour) return '•••• •••• •••• ••••'
    return `•••• •••• •••• ${lastFour}`
}

/**
 * Get relative time description
 */
export function getRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Hoy'
    if (diffInDays === 1) return 'Ayer'
    if (diffInDays < 7) return `Hace ${diffInDays} días`
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`
    return formatDate(d)
}
