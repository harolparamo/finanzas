const fs = require('fs');
const path = require('path');

const envFile = path.join(process.cwd(), '.env.local');
const env = fs.readFileSync(envFile, 'utf8');

function getEnv(key) {
    const match = env.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
}

async function run() {
    const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
    const anon = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const service = getEnv('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !service) {
        console.error('Missing credentials');
        return;
    }

    console.log(`Checking Supabase: ${url}`);

    const email = 'potencialidad@gmail.com';

    // List users via Admin API
    const response = await fetch(`${url}/auth/v1/admin/users`, {
        headers: {
            'apikey': anon,
            'Authorization': `Bearer ${service}`
        }
    });

    if (!response.ok) {
        const err = await response.text();
        console.error(`Error listing users: ${response.status}`, err);
        return;
    }

    const data = await response.json();
    const user = data.users.find(u => u.email === email);

    if (user) {
        console.log('\n--- User Found ---');
        console.log(`Email: ${user.email}`);
        console.log(`ID: ${user.id}`);
        console.log(`Confirmed: ${!!user.email_confirmed_at}`);
        console.log(`Metadata: ${JSON.stringify(user.user_metadata)}`);
    } else {
        console.log(`\nUser ${email} NOT found.`);
    }
}

run().catch(console.error);
