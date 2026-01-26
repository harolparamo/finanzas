'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </body>
        </html>
    )
}
