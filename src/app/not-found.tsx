import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
            <h2 className="text-4xl font-bold">404</h2>
            <p className="text-xl text-muted-foreground">Página no encontrada</p>
            <p>Lo sentimos, no pudimos encontrar lo que buscabas.</p>
            <Link href="/">
                <Button>
                    Volver al inicio
                </Button>
            </Link>
        </div>
    )
}
