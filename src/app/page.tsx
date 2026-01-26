import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BarChart3, Shield, Zap } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-light">
            {/* Header */}
            <header className="container mx-auto px-4 py-6">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                            <span className="text-lg font-bold text-primary-dark">₱</span>
                        </div>
                        <span className="text-xl font-semibold text-white">Finanzas</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-white hover:bg-white/10">
                                Iniciar sesión
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-white text-primary-dark hover:bg-white/90">
                                Registrarse
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero */}
            <main className="container mx-auto px-4 py-20">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Controla tus finanzas personales de forma inteligente
                    </h1>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                        Registra tus gastos e ingresos, establece presupuestos por categoría,
                        y alcanza tus metas de ahorro con nuestra plataforma intuitiva.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard">
                            <Button size="lg" className="bg-white text-primary-dark hover:bg-white/90 text-lg px-8">
                                Comenzar ahora
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                                Crear cuenta gratis
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                            Dashboard Visual
                        </h3>
                        <p className="text-white/70">
                            Visualiza tus finanzas con gráficas interactivas y métricas en tiempo real.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                            Presupuestos Inteligentes
                        </h3>
                        <p className="text-white/70">
                            Establece límites por categoría y recibe alertas cuando te acerques al límite.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Zap className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                            Metas de Ahorro
                        </h3>
                        <p className="text-white/70">
                            Define objetivos financieros y haz seguimiento de tu progreso mes a mes.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 mt-20 border-t border-white/10">
                <p className="text-center text-white/60 text-sm">
                    © 2025 Finanzas. Todos los derechos reservados.
                </p>
            </footer>
        </div>
    )
}
