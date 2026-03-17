require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  try {
    const { data: rows, error: fetchErr } = await supabase.from('orders').select('id, status').limit(2);
    if (fetchErr) {
        console.error('Fetch Error:', fetchErr);
        return;
    }
    
    if (rows && rows.length > 0) {
        const orderId = rows[0].id;
        console.log(`Trying to update order ${orderId} to 'Annulée' via API simulation...`);

        // simulate what API route does:
        const { data, error } = await supabase
            .from('orders')
            .update({ status: 'Annulée', updated_at: new Date().toISOString() })
            .eq('id', orderId);
            
        console.log('Update Error:', error);
    }
  } catch (e) {
      console.error(e);
  }
}

test();
