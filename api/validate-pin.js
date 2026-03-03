export default async function handler(req, res) {
    const { ADMIN_PIN } = process.env;

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const { pin } = req.body;

        if (pin === ADMIN_PIN) {
            return res.status(200).json({ success: true, message: 'Authenticated' });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid PIN' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Auth failed' });
    }
}
