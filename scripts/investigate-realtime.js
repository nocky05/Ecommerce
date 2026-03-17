const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigate() {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    console.log(`--- INVESTIGATING ADMIN: ${adminEmail} ---`);

    // 1. Find User in Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Error listing users:', authError);
        return;
    }

    const adminUser = users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());
    if (!adminUser) {
        console.error('Admin user not found in Supabase Auth!');
        return;
    }

    console.log('Admin Auth User ID:', adminUser.id);

    // 2. Check Profile and Role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminUser.id)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        if (profileError.code === 'PGRST116') {
            console.log('Profile does not exist for this user.');
        }
    } else {
        console.log('Profile Role in DB:', profile.role);
        if (profile.role !== 'admin') {
            console.warn('CRITICAL: User role is NOT "admin" in DB. RLS policies will block real-time events!');
        }
    }

    // 3. Check Orders Table and Realtime
    console.log('\n--- CHECKING ORDERS TABLE ---');
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .limit(1);

    if (ordersError) {
        console.error('Error querying orders:', ordersError.message);
    } else {
        console.log('Orders table is accessible with Service Key.');
    }

    // 4. Instructions for SQL Editor
    console.log('\n--- ACTION REQUIRED ---');
    console.log('Please run the following SQL in your Supabase SQL Editor:');
    console.log(`
-- 1. Enable Realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 2. Ensure Admin Role is set correctly (replace ID if needed)
UPDATE public.profiles SET role = 'admin' WHERE id = '${adminUser.id}';
    `);
}

investigate();
