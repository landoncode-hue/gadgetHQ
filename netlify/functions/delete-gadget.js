const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME, ADMIN_PIN } = process.env;
    const clientPin = event.headers['x-admin-pin'];

    const pathParts = event.path.split('/').filter(Boolean);
    const id = pathParts[pathParts.length - 1] === 'delete-gadget' ? null : pathParts[pathParts.length - 1];

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-PIN',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };
    if (event.httpMethod !== 'DELETE') return { statusCode: 405, headers, body: 'Method Not Allowed' };
    if (!clientPin || clientPin !== ADMIN_PIN) return { statusCode: 401, headers, body: JSON.stringify({ error: { message: 'Unauthorized' } }) };
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: { message: 'Missing record ID in path' } }) };

    try {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            },
        });

        const data = await response.json();
        return { statusCode: response.status, headers, body: JSON.stringify(data) };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to delete record', detail: error.message }) };
    }
};
