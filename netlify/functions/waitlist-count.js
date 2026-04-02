const https = require('https');

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const API_KEY = process.env.BREVO_API_KEY;
    const LIST_ID = process.env.BREVO_WAITLIST_ID;

    if (!API_KEY || !LIST_ID) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Config missing' }) };
    }

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.brevo.com',
            path: '/v3/contacts/lists/' + LIST_ID,
            method: 'GET',
            headers: {
                'api-key': API_KEY,
                'Accept': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const count = data.totalSubscribers || data.uniqueSubscribers || 0;
                    console.log('[Count] Waitlist:', count);
                    resolve({
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ count: count })
                    });
                } catch (e) {
                    resolve({
                        statusCode: 500,
                        headers,
                        body: JSON.stringify({ error: 'Parse error' })
                    });
                }
            });
        });

        req.on('error', (err) => {
            resolve({ statusCode: 500, headers, body: JSON.stringify({ error: err.message }) });
        });

        req.end();
    });
};
