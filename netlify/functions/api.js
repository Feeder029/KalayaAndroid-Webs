const { neon } = require('@neondatabase/serverless');
const bcrypt   = require('bcryptjs');

// ─── DB Connection ────────────────────────────────────────────────────────────
// Set DATABASE_URL in Netlify → Site Settings → Environment Variables
const sql = neon(process.env.DATABASE_URL);

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method not allowed.' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Invalid JSON.' }) };
    }

    const { action } = body;

    // ─── SIGN UP ──────────────────────────────────────────────────────────────
    if (action === 'signup') {
        const name     = (body.name     || '').trim();
        const email    = (body.email    || '').trim();
        const password =  body.password || '';

        if (!name || !email || !password) {
            return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'All fields are required.' }) };
        }
        if (password.length < 8) {
            return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Password must be at least 8 characters.' }) };
        }

        try {
            // Check duplicate email (stored in username column)
            const existing = await sql`SELECT accID FROM account WHERE username = ${email}`;
            if (existing.length > 0) {
                return { statusCode: 409, headers, body: JSON.stringify({ success: false, message: 'Email is already registered.' }) };
            }

            // Hash password and insert
            const hashed = await bcrypt.hash(password, 10);
            const result = await sql`
                INSERT INTO account (name, username, password)
                VALUES (${name}, ${email}, ${hashed})
                RETURNING accID
            `;

            return {
                statusCode: 200, headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Account created successfully!',
                    user: { accID: result[0].accid, name, email }
                })
            };
        } catch (err) {
            console.error('Signup error:', err);
            return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Server error. Please try again.' }) };
        }
    }

    // ─── SIGN IN ──────────────────────────────────────────────────────────────
    if (action === 'signin') {
        const email    = (body.email    || '').trim();
        const password =  body.password || '';

        if (!email || !password) {
            return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Email and password are required.' }) };
        }

        try {
            // username column holds the email
            const rows = await sql`
                SELECT accID, name, username, password FROM account WHERE username = ${email}
            `;

            if (rows.length === 0) {
                return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: 'Invalid email or password.' }) };
            }

            const user  = rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: 'Invalid email or password.' }) };
            }

            return {
                statusCode: 200, headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Sign in successful!',
                    user: { accID: user.accid, name: user.name, email: user.username }
                })
            };
        } catch (err) {
            console.error('Signin error:', err);
            return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Server error. Please try again.' }) };
        }
    }

    return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Unknown action.' }) };
};