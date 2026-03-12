require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfile(id) {
    console.log(`--- CHECKING PROFILE ID: ${id} ---`);

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Profile:', JSON.stringify(profile, null, 2));
    }
}

const id = process.argv[2] || "954d0aa6-202e-4e4b-a636-698874d5bf74";
checkProfile(id);
