require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPromoImage() {
    console.log("Fetching current homepage settings...");
    const { data: entry, error: fetchError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'homepage')
        .single();

    if (fetchError) {
        console.error("Error fetching settings:", fetchError);
        return;
    }

    const data = entry.data;
    if (data && data.side_cards && data.side_cards[0]) {
        // Fix for "Pianos Yamaha Série P" or whichever one has the triple dashes
        // Based on analysis, it was: product-4-yamaha-dgx-670---piano-num-
        data.side_cards[0].image = "/images/products/product-4-yamaha-dgx-670-piano-num-rique-88-touches.jpg";

        console.log("Updating to correct path:", data.side_cards[0].image);

        const { error: updateError } = await supabase
            .from('site_settings')
            .update({ data: data, updated_at: new Date().toISOString() })
            .eq('id', 'homepage');

        if (updateError) {
            console.error("Error updating settings:", updateError);
        } else {
            console.log("Successfully fixed 'OFFRE SP' image path in Supabase.");
        }
    } else {
        console.log("Structure not found or already correct.");
    }
}

fixPromoImage();
