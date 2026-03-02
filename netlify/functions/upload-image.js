const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event, context) => {
    const { IMGBB_API_KEY, ADMIN_PIN } = process.env;
    const clientPin = event.headers['x-admin-pin'];

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-PIN',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method Not Allowed' };
    if (!clientPin || clientPin !== ADMIN_PIN) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

    try {
        const body = JSON.parse(event.body);
        if (!body.image) throw new Error('Missing image data');

        const formData = new FormData();
        formData.append('image', body.image);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        return { statusCode: response.status, headers, body: JSON.stringify(data) };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Upload failed', detail: error.message }) };
    }
};
