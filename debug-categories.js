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

    const email = 'potencialidad@gmail.com';

    // 1. Get User ID
    const userRes = await fetch(`${url}/auth/v1/admin/users`, {
        headers: { 'apikey': anon, 'Authorization': `Bearer ${service}` }
    });
    const userData = await userRes.json();
    const user = userData.users.find(u => u.email === email);

    if (!user) {
        console.log(`User ${email} not found.`);
        return;
    }

    console.log(`User ID: ${user.id}`);

    // 2. Check Profile
    const profileRes = await fetch(`${url}/rest/v1/profiles?id=eq.${user.id}`, {
        headers: { 'apikey': anon, 'Authorization': `Bearer ${service}` }
    });
    const profiles = await profileRes.json();
    console.log(`Profile count: ${profiles.length}`);

    // 3. Check Categories
    const catRes = await fetch(`${url}/rest/v1/categories?user_id=eq.${user.id}`, {
        headers: { 'apikey': anon, 'Authorization': `Bearer ${service}` }
    });
    const categories = await catRes.json();
    console.log(`Categories count: ${categories.length}`);
    if (categories.length > 0) {
        console.log('Categories:', categories.map(c => c.name).join(', '));
    }
}

run().catch(console.error);
