const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event, context) => {
    const { IMGBB_API_KEY } = process.env;

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body); // Expects { image: 'base64str' }

        const formData = new FormData();
        formData.append('image', body.image);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Upload failed' }),
        };
    }
};
