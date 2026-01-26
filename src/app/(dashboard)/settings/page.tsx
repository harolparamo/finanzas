'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/auth-store'
import { User, Globe, Shield, Check } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function SettingsPage() {
    const { user, setUser } = useAuthStore()

    // Local state for form
    const [mounted, setMounted] = useState(false)
    const [localName, setLocalName] = useState('')
    const [saved, setSaved] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setMounted(true)
        if (user) {
            setLocalName(user.full_name || '')
        }
    }, [user])

    if (!mounted) return null

    const handleSave = () => {
        if (user) {
            setUser({ ...user, full_name: localName })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && user) {
            // Convert to base64 for local storage
            const reader = new FileReader()
            reader.onloadend = () => {
                const newAvatarUrl = reader.result as string
                setUser({ ...user, avatar_url: newAvatarUrl })
            }
            reader.readAsDataURL(file)
        }
    }

    const getInitials = () => {
        return (localName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary-dark">Configuración</h1>
                <p className="text-muted-foreground">Gestiona tu perfil y preferencias</p>
            </div>

            {/* Profile */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Perfil
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            {user?.avatar_url && <AvatarImage src={user.avatar_url} alt={localName} />}
                            <AvatarFallback className="bg-accent text-primary-dark text-2xl">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/jpeg,image/png"
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Cambiar foto
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1">JPG o PNG. Máximo 1MB.</p>
                            {user?.avatar_url && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-danger mt-1"
                                    onClick={() => user && setUser({ ...user, avatar_url: null })}
                                >
                                    Eliminar foto
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre completo</Label>
                            <Input
                                id="name"
                                value={localName}
                                onChange={(e) => setLocalName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={user?.email || ''} disabled />
                        </div>
                    </div>

                    <Button onClick={handleSave} className="gap-2">
                        {saved && <Check className="h-4 w-4" />}
                        {saved ? 'Guardado!' : 'Guardar cambios'}
                    </Button>
                </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Preferencias (Solo visualización)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Moneda</Label>
                            <Select value={user?.currency || 'COP'} disabled>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona moneda" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                                    <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Zona horaria</Label>
                            <Select value={user?.timezone || 'America/Bogota'} disabled>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona zona horaria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="America/Bogota">America/Bogota (UTC-5)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Seguridad
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline">Cambiar contraseña</Button>
                    <p className="text-xs text-muted-foreground">
                        Por seguridad, te enviaremos un correo para confirmar el cambio de contraseña.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
