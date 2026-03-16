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
    console.log('Sample orders:', rows);
    
    if (rows && rows.length > 0) {
        const orderId = rows[0].id;
        const originalStatus = rows[0].status;
        console.log(`Trying to update order ${orderId} to 'Annulée'`);
        
        const { data, error } = await supabase.from('orders')
          .update({ status: 'Annulée' })
          .eq('id', orderId)
          .select();
          
        console.log('Update Error:', error);
        
        // Revert it
        await supabase.from('orders').update({ status: originalStatus }).eq('id', orderId);
    }
  } catch (e) {
      console.error(e);
  }
}

test();
