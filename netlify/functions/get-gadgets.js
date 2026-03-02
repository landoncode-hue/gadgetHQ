const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

    // Support single record fetch: /get-gadgets/rec123
    const pathParts = event.path.split('/');
    const id = pathParts[pathParts.length - 1] === 'get-gadgets' ? '' : pathParts[pathParts.length - 1];

    try {
        const url = id
            ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`
            : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Airtable API Error:', data);
            return {
                statusCode: response.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS'
                },
                body: JSON.stringify({ error: data.error || { message: 'Failed to fetch data from Airtable' } })
            };
        }

        return {
            statusCode: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Basic CORS safety
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('Server Internal Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: JSON.stringify({ error: { message: 'Internal Server Error', detail: error.message } }),
        };
    }
};
