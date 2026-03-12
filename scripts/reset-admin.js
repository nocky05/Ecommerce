const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const adminEmail = 'nagaloaser@gmail.com';
const adminPassword = '41257111';

async function resetAdmin() {
    console.log(`Resetting admin user: ${adminEmail}...`);

    // 1. Find the user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());

    if (existingUser) {
        console.log(`Deleting existing user: ${existingUser.id}...`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
        if (deleteError) throw deleteError;
        console.log('User deleted.');
    }

    // 2. Create the user
    console.log('Creating new confirmed admin user...');
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: 'Administrateur' }
    });

    if (createError) throw createError;
    console.log(`User created successfully: ${user.id}`);

    // 3. Ensure profile has admin role
    console.log('Setting admin role in profile...');
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            role: 'admin',
            full_name: 'Administrateur'
        });

    if (profileError) throw profileError;
    console.log('Admin profile ready with role: admin');
}

resetAdmin()
    .then(() => console.log('Admin reset complete!'))
    .catch(err => console.error('Reset failed:', err));
