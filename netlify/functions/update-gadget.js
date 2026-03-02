const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME, ADMIN_PIN } = process.env;
    const clientPin = event.headers['x-admin-pin'];

    const pathParts = event.path.split('/').filter(Boolean);
    const id = pathParts[pathParts.length - 1] === 'update-gadget' ? null : pathParts[pathParts.length - 1];

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-PIN',
        'Access-Control-Allow-Methods': 'PATCH, PUT, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };
    if (event.httpMethod !== 'PATCH' && event.httpMethod !== 'PUT') return { statusCode: 405, headers, body: 'Method Not Allowed' };
    if (!clientPin || clientPin !== ADMIN_PIN) return { statusCode: 401, headers, body: JSON.stringify({ error: { message: 'Unauthorized' } }) };
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: { message: 'Missing record ID in path' } }) };

    try {
        const body = JSON.parse(event.body);
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Airtable API Error:', data);
            return { statusCode: response.status, headers, body: JSON.stringify({ error: data.error || { message: 'Failed to update record in Airtable' } }) };
        }

        return { statusCode: response.status, headers, body: JSON.stringify(data) };
    } catch (error) {
        console.error('Server Internal Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: { message: 'Internal Server Error', detail: error.message } }) };
    }
};

