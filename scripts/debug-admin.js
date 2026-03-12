const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
    const email = 'nagaloaser@gmail.com';
    console.log(`Checking database state for: ${email}`);

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        console.log('❌ User not found in auth.users');
        return;
    }

    console.log(`✅ User found (ID: ${user.id}, Confirmed: ${!!user.email_confirmed_at})`);

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.log('❌ Profile not found or error:', profileError.message);
    } else {
        console.log(`✅ Profile found. Role: ${profile.role}`);
    }
}

checkUser();
