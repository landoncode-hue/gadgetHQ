const fetch = require('node-fetch');

export default async function handler(req, res) {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

    // Vercel handles IDs in query or we can parse from URL
    // In Netlify it was /get-gadgets/rec123
    // In Vercel /api/get-gadgets/rec123 (if we use rewrites) or /api/get-gadgets?id=rec123
    // To maintain compatibility with the current frontend calls like `/api/get-gadgets/${id}`:
    const urlParts = req.url.split('/').filter(Boolean);
    const id = urlParts.length > 2 ? urlParts[urlParts.length - 1] : req.query.id;

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-PIN',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

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
            return res.status(response.status).json({ error: data.error || { message: 'Failed to fetch data from Airtable' } });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Server Internal Error:', error);
        return res.status(500).json({ error: { message: 'Internal Server Error', detail: error.message } });
    }
}
