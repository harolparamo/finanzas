'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const { login } = useAuthStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Get values from form
        const target = e.target as typeof e.target & {
            email: { value: string }
            password: { value: string }
        }
        const email = target.email.value
        const password = target.password.value

        const success = await login(email, password)

        if (success) {
            router.push('/dashboard')
        } else {
            setIsLoading(false)
            // Optional: Show error
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                        <span className="text-xl font-bold text-white">₱</span>
                    </div>
                </div>
                <CardTitle className="text-2xl">Bienvenido</CardTitle>
                <CardDescription>Ingresa a tu cuenta para continuar</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            defaultValue="demo@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Contraseña</Label>
                            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            defaultValue="demo123"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Ingresando...' : 'Ingresar'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    ¿No tienes cuenta?{' '}
                    <Link href="/register" className="text-primary font-medium hover:underline">
                        Regístrate
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
