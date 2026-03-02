const fetch = require('node-fetch');

async function testUpload() {
    // Generate a tiny 1x1 base64 GIF for testing
    const base64Image = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    const payload = {
        image: base64Image
    };

    console.log('Sending mock image to Production upload-image endpoint...');

    try {
        const response = await fetch('https://gadgethq-official.netlify.app/.netlify/functions/upload-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-PIN': '1234'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Success! Image uploaded.');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error('❌ Failed! HTTP Status:', response.status);
            console.error(JSON.stringify(data, null, 2));
        }
    } catch(err) {
        console.error('Network Error:', err.message);
    }
}

testUpload();
