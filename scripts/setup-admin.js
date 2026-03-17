const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const adminEmail = 'nagaloaser@gmail.com';
const adminPassword = '41257111';

async function setupAdmin() {
    console.log(`Setting up admin user: ${adminEmail}...`);

    // 1. Get all users to see if our admin exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());

    if (existingUser) {
        console.log('User already exists, updating password and confirming email...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
                password: adminPassword,
                email_confirm: true,
                user_metadata: { full_name: 'Administrateur' }
            }
        );
        if (updateError) {
            console.error('Error updating user:', updateError);
            return;
        }
        console.log('User updated successfully.');
        await ensureProfile(existingUser.id);
    } else {
        console.log('Creating new admin user...');
        const { data: user, error: createError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { full_name: 'Administrateur' }
        });
        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }
        console.log('User created successfully.');
        await ensureProfile(user.user.id);
    }
}

async function ensureProfile(userId) {
    console.log('Ensuring admin profile exists with correct role...');
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            role: 'admin',
            full_name: 'Administrateur'
        });

    if (profileError) {
        console.error('Error updating profile:', profileError);
    } else {
        console.log('Admin profile ready.');
    }
}

setupAdmin()
    .then(() => console.log('Admin setup complete!'))
    .catch(err => console.error('Setup failed:', err));
