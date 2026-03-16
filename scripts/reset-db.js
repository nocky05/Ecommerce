require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetDB() {
  console.log('--- RESETTING DATABASE ---');

  // 1. Wipe Orders
  const { error: errOrders } = await supabase.from('orders').delete().neq('id', 'dummy');
  if (errOrders) console.error('Error wiping orders:', errOrders);
  else console.log('Orders wiped (DELETE * FROM orders).');

  // 2. Wipe Wishlists
  const { error: errWishlists } = await supabase.from('wishlists').delete().neq('id', 0);
  if (errWishlists) console.error('Error wiping wishlists:', errWishlists);
  else console.log('Wishlists wiped (DELETE * FROM wishlists).');

  // 3. Update site_settings Table branding (where the footer/header text lives)
  const { data: settings, error: errGetSettings } = await supabase.from('site_settings').select('*');
  
  if (errGetSettings) {
    console.error('Error fetching site_settings:', errGetSettings);
  } else {
    for (const row of settings) {
      // The site_settings table uses 'id' and 'data' columns
      let val = row.data;
      let updated = false;

      // Recursively replace strings in JSON object
      function replaceInObj(obj) {
        for (let key in obj) {
          if (typeof obj[key] === 'string') {
              if (obj[key].includes('MusicMarket')) {
                  obj[key] = obj[key].replace(/MusicMarket/g, 'Chez le musicien');
                  updated = true;
              }
              if (obj[key].includes('MUSIC MARKET')) {
                  obj[key] = obj[key].replace(/MUSIC MARKET/g, 'CHEZ LE MUSICIEN');
                  updated = true;
              }
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              replaceInObj(obj[key]);
          }
        }
      }
      
      replaceInObj(val);

      if (updated) {
         const { error: updateErr } = await supabase.from('site_settings').update({ data: val }).eq('id', row.id);
         if (updateErr) console.error(`Error updating site_settings [${row.id}]:`, updateErr);
         else console.log(`site_settings [${row.id}] branding updated in DB.`);
      }
    }
  }

  console.log('--- RESET COMPLETE ---');
}

resetDB();
