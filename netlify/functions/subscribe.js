const https = require('https');

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function brevoRequest(apiKey, method, path, payload) {
    return new Promise((resolve, reject) => {
        const data = payload ? JSON.stringify(payload) : '';
        const options = {
            hostname: 'api.brevo.com',
            path: '/v3' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
                'Accept': 'application/json',
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
                catch (e) { resolve({ status: res.statusCode, data: body }); }
            });
        });
        req.on('error', (err) => reject(err));
        if (data) req.write(data);
        req.end();
    });
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const API_KEY = process.env.BREVO_API_KEY;
    if (!API_KEY) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key missing' }) };
    }

    try {
        const data = JSON.parse(event.body);
        console.log('[Subscribe]', data.email, '→ list', data.listId);

        if (!data.email || !data.listId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and listId required' }) };
        }

        // Nur erlaubte Listen
        const ALLOWED = process.env.BREVO_ALLOWED_LISTS
            ? process.env.BREVO_ALLOWED_LISTS.split(',').map(s => parseInt(s.trim()))
            : [];

        const listId = parseInt(data.listId);
        if (ALLOWED.length > 0 && !ALLOWED.includes(listId)) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid list' }) };
        }

        // Contact anlegen/updaten
        const attributes = {};
        if (data.fields) {
            if (data.fields.name) attributes.VORNAME = data.fields.name;
            if (data.fields.last_name) attributes.NACHNAME = data.fields.last_name;
            if (data.fields.phone) attributes.SMS = data.fields.phone;
            if (data.fields.company) attributes.ZIEL = data.fields.company;
            if (data.fields.state) attributes.NACHRICHT = data.fields.state;
            if (data.fields.tier) attributes.ERFAHRUNG = data.fields.tier;
        }

        const result = await brevoRequest(API_KEY, 'POST', '/contacts', {
            email: data.email,
            attributes: attributes,
            listIds: [listId],
            updateEnabled: true
        });

        console.log('[Subscribe] Brevo:', result.status, JSON.stringify(result.data).substring(0, 300));

        // 201 = created, 204 = updated
        if (result.status === 201 || result.status === 204) {
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, email: data.email }) };
        }

        // Duplicate contact - update lists
        if (result.status === 400 && result.data?.message?.includes('already exist')) {
            const updateResult = await brevoRequest(API_KEY, 'PUT', '/contacts/' + encodeURIComponent(data.email), {
                attributes: attributes,
                listIds: [listId]
            });
            console.log('[Subscribe] Update existing:', updateResult.status);
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, email: data.email, updated: true }) };
        }

        return { statusCode: result.status || 500, headers, body: JSON.stringify({ error: 'Brevo error', details: result.data }) };

    } catch (err) {
        console.error('[Subscribe] Error:', err.message);
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
};
