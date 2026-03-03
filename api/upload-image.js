const fetch = require('node-fetch');
const FormData = require('form-data');

export default async function handler(req, res) {
    const { IMGBB_API_KEY, ADMIN_PIN } = process.env;
    const clientPin = req.headers['x-admin-pin'];

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    if (!clientPin || clientPin !== ADMIN_PIN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { image } = req.body;
        if (!image) throw new Error('Missing image data');

        const formData = new FormData();
        formData.append('image', image);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('ImgBB API Error:', data);
            return res.status(response.status).json({ error: data.error || { message: 'Failed to upload image' } });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Server Internal Error:', error);
        return res.status(500).json({ error: { message: 'Internal Server Error', detail: error.message } });
    }
}
