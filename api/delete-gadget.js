const fetch = require('node-fetch');

export default async function handler(req, res) {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME, ADMIN_PIN } = process.env;
    const clientPin = req.headers['x-admin-pin'];

    const urlParts = req.url.split('/').filter(Boolean);
    const id = urlParts.length > 2 ? urlParts[urlParts.length - 1] : req.query.id;

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE') {
        return res.status(405).send('Method Not Allowed');
    }

    if (!clientPin || clientPin !== ADMIN_PIN) {
        return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    if (!id) {
        return res.status(400).json({ error: { message: 'Missing record ID' } });
    }

    try {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Airtable API Error:', data);
            return res.status(response.status).json({ error: data.error || { message: 'Failed to delete record in Airtable' } });
        }

        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Server Internal Error:', error);
        return res.status(500).json({ error: { message: 'Internal Server Error', detail: error.message } });
    }
}
