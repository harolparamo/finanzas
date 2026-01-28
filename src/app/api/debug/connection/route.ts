import { NextResponse } from 'next/server'

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing'

    const diagnostics: any = {
        env: {
            supabaseUrl,
            supabaseAnonKey,
            supabaseServiceKey,
            nodeEnv: process.env.NODE_ENV
        },
        connectivity: {}
    }

    if (supabaseUrl) {
        try {
            const start = Date.now()
            const res = await fetch(supabaseUrl, { method: 'GET', timeout: 5000 } as any)
            diagnostics.connectivity = {
                status: res.status,
                ok: res.ok,
                time: `${Date.now() - start}ms`
            }
        } catch (error: any) {
            diagnostics.connectivity = {
                error: error.message
            }
        }
    }

    return NextResponse.json(diagnostics)
}
