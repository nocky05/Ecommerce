require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, image')
        .in('id', [218, 225]);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('--- SUPABASE CHECK ---');
    console.log(JSON.stringify(data, null, 2));
}

check();
