import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Control de Gastos - Finanzas Personales',
    description: 'Aplicación para controlar tus gastos personales mensuales',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className="min-h-screen bg-background">
                {children}
            </body>
        </html>
    )
}
