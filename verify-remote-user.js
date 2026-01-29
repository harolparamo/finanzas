const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function verifyUser() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Error: Missing credentials in .env.local')
        return
    }

    console.log(`Connecting to: ${supabaseUrl}`)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const email = 'potencialidad@gmail.com'

    // 1. Check Auth User
    console.log(`\nChecking Auth User: ${email}...`)
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError.message)
        return
    }

    const user = users.users.find(u => u.email === email)
    if (!user) {
        console.log('Result: User NOT FOUND in Auth.')
    } else {
        console.log('Result: User FOUND.')
        console.log(`- ID: ${user.id}`)
        console.log(`- Confirmed: ${!!user.email_confirmed_at}`)
        console.log(`- Last Sign In: ${user.last_sign_in_at}`)
    }

    // 2. Check Profile
    if (user) {
        console.log(`\nChecking Profile for ID: ${user.id}...`)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error('Error fetching profile:', profileError.message)
        } else {
            console.log('Result: Profile FOUND.')
            console.log(`- Full Name: ${profile.full_name}`)
        }
    }

    // 3. Check Connectivity
    console.log('\nTesting Public connectivity...')
    try {
        const res = await fetch(supabaseUrl)
        console.log(`Result: Supabase URL reachable. Status: ${res.status}`)
    } catch (e) {
        console.error('Result: Supabase URL NOT reachable from this machine.', e.message)
    }
}

verifyUser()
