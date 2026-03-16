require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function testApi() {
  try {
    const orderId = '#CMD-4880945'; // Existing order
    console.log(`Sending POST to http://localhost:3000/api/orders to update status to 'Annulée'`);

    const response = await axios.post('http://localhost:3000/api/orders', {
      action: 'updateStatus',
      orderId: orderId,
      status: 'Annulée'
    });
    
    console.log('API Response:', response.data);
  } catch (e) {
      console.error('API Error:', e.response ? e.response.data : e.message);
  }
}

testApi();
