require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser(email) {
    console.log(`--- CHECKING USER: ${email} ---`);

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', email);

    if (error) {
        console.error('Error fetching profile:', error);
    } else {
        console.log('Profile found:', JSON.stringify(profiles, null, 2));
    }

    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Error fetching auth users:', authError);
    } else {
        const user = authUser.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        console.log('Auth User:', user ? JSON.stringify({ id: user.id, email: user.email }, null, 2) : 'Not found in Auth');
    }
}

const email = process.argv[2] || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
checkUser(email);
