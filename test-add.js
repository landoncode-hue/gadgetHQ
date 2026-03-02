const fetch = require('node-fetch');
require('dotenv').config();

async function testAddProduct() {
    const payload = {
        records: [
            {
                fields: {
                    Name: "Ultra Power Bank",
                    Price: 25000,
                    Image: "https://placehold.co/600x400?text=Ultra+Power+Bank",
                    Status: "In Stock"
                }
            }
        ]
    };

    console.log('Sending request to Production create-gadget function...');
    console.log('Using PIN:', process.env.ADMIN_PIN || '1234');

    try {
        const response = await fetch('https://gadgethq-official.netlify.app/.netlify/functions/create-gadget', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-PIN': process.env.ADMIN_PIN || '1234'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Success! Product added.');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error('❌ Failed! HTTP Status:', response.status);
            console.error(data);
        }
    } catch(err) {
        console.error('Network Error:', err.message);
    }
}

testAddProduct();
