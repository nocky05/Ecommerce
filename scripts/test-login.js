const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
    const email = 'nagaloaser@gmail.com';
    const password = '41257111';
    console.log(`Testing login for: ${email}...`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error('❌ Login failed:', error.message);
    } else {
        console.log('✅ Login successful!');
        console.log('User ID:', data.user.id);
    }
}

testLogin();
