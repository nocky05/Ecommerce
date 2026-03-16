require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forceBranding() {
  console.log('--- FORCING BRANDING IN DB ---');

  // General settings
  const genData = {
    name: "Chez le musicien Côte d'Ivoire",
    email: "contact@chezlemusicien.ci",
    phone: "+225 07 77 000 000",
    whatsapp: "+225 07 77 000 000",
    address: "Abidjan, Cocody Riviera, Boulevard de la Glisse",
    facebook: "#",
    instagram: "#",
    twitter: "#"
  };

  const { error: err1 } = await supabase.from('site_settings').upsert({ id: 'general', data: genData });
  if (err1) console.error('Error general:', err1);
  else console.log('General settings forced.');

  // Homepage settings (footer description etc)
  const { data: homeRow, error: err2 } = await supabase.from('site_settings').select('data').eq('id', 'homepage').single();
  if (homeRow) {
      let data = homeRow.data;
      
      function deepReplace(obj) {
          for (let key in obj) {
              if (typeof obj[key] === 'string') {
                  obj[key] = obj[key].replace(/MusicMarket/g, 'Chez le musicien');
                  obj[key] = obj[key].replace(/Music Market/g, 'Chez le musicien');
                  obj[key] = obj[key].replace(/MUSIC MARKET/g, 'CHEZ LE MUSICIEN');
                  obj[key] = obj[key].replace(/musicmarket/g, 'chezlemusicien');
              } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                  deepReplace(obj[key]);
              }
          }
      }
      deepReplace(data);
      
      const { error: err3 } = await supabase.from('site_settings').update({ data }).eq('id', 'homepage');
      if (err3) console.error('Error homepage:', err3);
      else console.log('Homepage settings replaced.');
  }

  console.log('--- DONE ---');
}

forceBranding();
