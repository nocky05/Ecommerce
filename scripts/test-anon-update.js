require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAnonUpdate() {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'Annulée' })
    .eq('id', '#CMD-4880945')
    .select();
  console.log('Anon Update Error:', error);
}

checkAnonUpdate();
