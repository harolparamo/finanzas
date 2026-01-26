'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => {
            setSent(true)
            setIsLoading(false)
        }, 1000)
    }

    if (sent) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success">
                            <Mail className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Revisa tu email</CardTitle>
                    <CardDescription>
                        Te hemos enviado un enlace para restablecer tu contraseña.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/login">
                        <Button variant="outline" className="w-full">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver al login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                        <span className="text-xl font-bold text-white">₱</span>
                    </div>
                </div>
                <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
                <CardDescription>
                    Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="tu@email.com" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Enviando...' : 'Enviar enlace'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Volver al login
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
