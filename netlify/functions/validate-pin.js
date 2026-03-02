exports.handler = async (event, context) => {
    const { ADMIN_PIN } = process.env;

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { pin } = JSON.parse(event.body);

        if (pin === ADMIN_PIN) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, message: 'Authenticated' }),
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ success: false, message: 'Invalid PIN' }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Auth failed' }),
        };
    }
};
