'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate registration
        setTimeout(() => {
            router.push('/dashboard')
        }, 500)
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                        <span className="text-xl font-bold text-white">₱</span>
                    </div>
                </div>
                <CardTitle className="text-2xl">Crear cuenta</CardTitle>
                <CardDescription>Regístrate para comenzar a gestionar tus finanzas</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input id="name" placeholder="Tu nombre" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="tu@email.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input id="password" type="password" placeholder="••••••••" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm">Confirmar contraseña</Label>
                        <Input id="confirm" type="password" placeholder="••••••••" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="text-primary font-medium hover:underline">
                        Inicia sesión
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
